import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { Application, InterviewRound, InterviewRoundStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { InterviewScheduleModal } from '../components/placement/InterviewScheduleModal';
import { InterviewRescheduleModal } from '../components/placement/InterviewRescheduleModal';
import { RejectionFeedbackModal } from '../components/placement/RejectionFeedbackModal';
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Building2,
  ChevronRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const RecruiterInterviewsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [reschedulingRound, setReschedulingRound] = useState<{ app: Application; round: InterviewRound } | null>(null);
  const [rejectingRound, setRejectingRound] = useState<{ app: Application; round: InterviewRound } | null>(null);
  const [cancellingRound, setCancellingRound] = useState<{ app: Application; round: InterviewRound } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const allJobs = StorageService.getJobPosts();
  const allApplications = StorageService.getApplications();

  // Role-specific filtering:
  // ONLY candidates who have actually been shortlisted or moved to interview stage (or already have rounds)
  const interviewApplications = useMemo(() => {
    let baseApps = allApplications;

    if (currentUser.role === 'recruiter') {
      const company = (currentUser.companyName || '').toLowerCase().trim();
      const myJobIds = new Set(
        allJobs
          .filter(j => j.recruiterId === currentUser.id || (company && j.company.toLowerCase().includes(company)))
          .map(j => j.id)
      );
      baseApps = allApplications.filter(a => myJobIds.has(a.jobId));
    } else if (currentUser.role === 'student') {
      baseApps = allApplications.filter(a =>
        a.studentId === currentUser.id ||
        (currentUser.rollNo && a.studentRollNo === currentUser.rollNo) ||
        (currentUser.email && (a as any).studentEmail === currentUser.email)
      );
    }

    // STRICT REQUIREMENT: Only shortlisted candidates or candidates explicitly moved to interview stage
    // (Do not repeat the complete raw application list in Interviews)
    return baseApps.filter(app => {
      const hasRounds = app.interviewRounds && app.interviewRounds.length > 0;
      const isInterviewStage =
        app.status === 'Shortlisted' ||
        app.status === 'Interviewing' ||
        app.status === 'Interview Scheduled' ||
        app.status === 'Selected' ||
        (app.status === 'Rejected' && hasRounds) ||
        (app.status === 'On Hold' && hasRounds);

      return hasRounds || isInterviewStage;
    });
  }, [allApplications, allJobs, currentUser, dataVersion]);

  // Compute status counts for interview rounds
  const counts = useMemo(() => {
    const allRounds = interviewApplications.flatMap(a => a.interviewRounds || []);
    return {
      all: interviewApplications.length,
      Scheduled: allRounds.filter(r => r.status === 'Scheduled').length,
      Rescheduled: allRounds.filter(r => r.status === 'Rescheduled').length,
      'In Progress': allRounds.filter(r => r.status === 'In Progress').length,
      Completed: allRounds.filter(r => r.status === 'Completed').length,
      Selected: allRounds.filter(r => r.status === 'Selected').length,
      Rejected: allRounds.filter(r => r.status === 'Rejected').length,
      'On Hold': allRounds.filter(r => r.status === 'On Hold').length,
    };
  }, [interviewApplications]);

  const filteredApps = useMemo(() => {
    return interviewApplications.filter(app => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.studentRollNo && app.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;

      // Filter by either round status or overall application status
      const hasMatchingRound = app.interviewRounds?.some(
        r => r.status.toLowerCase() === statusFilter.toLowerCase()
      );
      const matchesAppStatus = app.status.toLowerCase() === statusFilter.toLowerCase();

      return hasMatchingRound || matchesAppStatus;
    });
  }, [interviewApplications, searchTerm, statusFilter]);

  const canManage = currentUser.role === 'recruiter' || currentUser.role === 'placement';

  const handleMarkCompleted = (app: Application, round: InterviewRound) => {
    StorageService.updateInterviewRound(app.id, round.id, {
      status: 'Completed',
      feedback: round.feedback || 'Round evaluated and completed successfully.'
    });
    showToast(`Round "${round.roundName}" marked as Completed.`, 'success');
  };

  const handleMarkSelected = (app: Application, round: InterviewRound) => {
    StorageService.updateInterviewRound(app.id, round.id, {
      status: 'Selected',
      feedback: round.feedback || 'Candidate passed round evaluation.'
    });
    showToast(`Candidate selected for "${round.roundName}".`, 'success');
  };

  const handleConfirmCancel = () => {
    if (!cancellingRound) return;
    try {
      StorageService.cancelInterviewRound(
        cancellingRound.app.id,
        cancellingRound.round.id,
        cancelReason.trim() || undefined
      );
      showToast(`Interview round "${cancellingRound.round.roundName}" cancelled and placed on hold. Student notified.`, 'info');
      setCancellingRound(null);
      setCancelReason('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            <span>
              {currentUser.role === 'student'
                ? 'My Interview Schedule & Evaluation Pipeline'
                : 'Interviews – Scheduling & Round Management'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'student'
              ? 'Real-time multi-round schedules, access links, panel details, and recruiter feedback.'
              : 'Dedicated management for scheduling candidate rounds, tracking interview progress, and recording outcomes.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate, role, or company..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg w-fit overflow-x-auto shadow-2xs">
        {['all', 'Scheduled', 'Rescheduled', 'In Progress', 'Completed', 'Selected', 'Rejected', 'On Hold'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === st
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{st}</span>
          </button>
        ))}
      </div>

      {/* Candidate Interview List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl space-y-2">
            <Video className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No candidates match current interview filters.</p>
            <p className="max-w-md mx-auto text-slate-400">
              Only candidates who have been shortlisted or have active interview rounds are tracked in this module.
            </p>
          </div>
        ) : (
          filteredApps.map(app => {
            const rounds = app.interviewRounds || [];

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-purple-200 transition-all"
              >
                {/* Candidate & Job Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-slate-900">{app.studentName}</h3>
                      <span className="text-xs text-slate-400 font-mono">({app.studentRollNo})</span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>{app.jobTitle}</strong> · {app.company} · {app.studentDepartment} (CGPA: {app.studentCGPA.toFixed(2)})
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSchedulingApp(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule Next Round</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Chronological Interview Rounds */}
                {rounds.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                    <span>Candidate shortlisted. No interview rounds scheduled yet.</span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setSchedulingApp(app)}
                        className="text-purple-600 font-semibold hover:underline"
                      >
                        Schedule Round 1 →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Chronological Interview Rounds ({rounds.length})
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {rounds.map((round) => (
                        <div
                          key={round.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center font-mono">
                                {round.roundNumber}
                              </span>
                              <strong className="text-slate-900">{round.roundName}</strong>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusBadge status={round.status} size="sm" />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(round.dateTime).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {round.mode}
                            </span>
                            {round.interviewer && (
                              <>
                                <span>·</span>
                                <span>Panel: <strong>{round.interviewer}</strong></span>
                              </>
                            )}
                          </div>

                          {round.meetingLinkOrVenue && (
                            <div className="p-2 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700 flex items-center justify-between">
                              <span className="truncate">{round.meetingLinkOrVenue}</span>
                              {round.meetingLinkOrVenue.startsWith('http') && (
                                <a
                                  href={round.meetingLinkOrVenue}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                                >
                                  Join Session <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Round Evaluation / Rejection Feedback Display */}
                          {round.status === 'Rejected' ? (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold flex items-center gap-1 text-rose-800">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Round Rejection Outcome</span>
                                </span>
                                {round.rejectionFeedback?.category && (
                                  <span className="px-2 py-0.5 bg-white border border-rose-300 rounded font-medium text-rose-700">
                                    {round.rejectionFeedback.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 italic">
                                "{round.rejectionFeedback?.feedback || round.feedback || 'No detailed feedback has been provided by the recruiter.'}"
                              </p>
                            </div>
                          ) : (
                            round.feedback && (
                              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700">
                                <span className="font-semibold text-slate-800 block text-[10px] uppercase">
                                  Evaluation Feedback:
                                </span>
                                <p className="italic text-slate-600 mt-0.5">"{round.feedback}"</p>
                              </div>
                            )
                          )}

                          {/* Recruiter / Placement Action Buttons */}
                          {canManage && (
                            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReschedulingRound({ app, round })}
                                className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-white hover:bg-amber-50 border border-amber-300 rounded-md transition-colors cursor-pointer"
                              >
                                Reschedule Slot
                              </button>

                              {round.status !== 'Completed' && round.status !== 'Selected' && round.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(app, round)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
                                >
                                  Mark Completed
                                </button>
                              )}

                              {round.status !== 'Selected' && round.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkSelected(app, round)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-md transition-colors cursor-pointer"
                                >
                                  Pass Round
                                </button>
                              )}

                              {round.status !== 'Rejected' && round.status !== 'On Hold' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancellingRound({ app, round });
                                    setCancelReason('');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
                                >
                                  Cancel Slot
                                </button>
                              )}

                              {round.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => setRejectingRound({ app, round })}
                                  className="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-md transition-colors cursor-pointer"
                                >
                                  Reject Round
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      {schedulingApp && (
        <InterviewScheduleModal
          isOpen={!!schedulingApp}
          onClose={() => setSchedulingApp(null)}
          application={schedulingApp}
          onScheduled={() => {
            setSchedulingApp(null);
          }}
        />
      )}

      {/* Reschedule Modal */}
      {reschedulingRound && (
        <InterviewRescheduleModal
          isOpen={!!reschedulingRound}
          onClose={() => setReschedulingRound(null)}
          application={reschedulingRound.app}
          round={reschedulingRound.round}
          onSuccess={() => {
            setReschedulingRound(null);
          }}
        />
      )}

      {/* Rejection Feedback Modal */}
      {rejectingRound && (
        <RejectionFeedbackModal
          isOpen={!!rejectingRound}
          onClose={() => setRejectingRound(null)}
          application={rejectingRound.app}
          interviewRound={rejectingRound.round}
          onSuccess={() => {
            setRejectingRound(null);
          }}
        />
      )}

      {/* Cancel Interview Slot Modal */}
      {cancellingRound && (
        <Modal
          isOpen={!!cancellingRound}
          onClose={() => {
            setCancellingRound(null);
            setCancelReason('');
          }}
          title={`Cancel Interview: ${cancellingRound.round.roundName}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this interview session for{' '}
              <strong>{cancellingRound.app.studentName}</strong> ({cancellingRound.app.jobTitle})? This will put the round on hold and immediately send an official notification to the candidate.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Required):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Interview panel member unavailable; slot will be reorganized."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCancellingRound(null);
                  setCancelReason('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
              >
                Keep Scheduled
              </button>
              <button
                type="button"
                disabled={!cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
