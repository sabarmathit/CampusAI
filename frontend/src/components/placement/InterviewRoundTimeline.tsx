import React, { useState } from 'react';
import { Application, InterviewRound, InterviewRoundStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Check, 
  ExternalLink,
  Clock,
  XCircle
} from 'lucide-react';
import { InterviewScheduleModal } from './InterviewScheduleModal';
import { RejectionFeedbackModal } from './RejectionFeedbackModal';

interface InterviewRoundTimelineProps {
  application: Application;
  onUpdated: () => void;
  readOnly?: boolean;
}

const ALL_STATUSES: InterviewRoundStatus[] = [
  'Scheduled',
  'Rescheduled',
  'In Progress',
  'Completed',
  'Selected',
  'Rejected',
  'On Hold'
];

export const InterviewRoundTimeline: React.FC<InterviewRoundTimelineProps> = ({
  application,
  onUpdated,
  readOnly = false
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rejectingRound, setRejectingRound] = useState<InterviewRound | null>(null);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<InterviewRoundStatus>('Scheduled');
  const [editFeedback, setEditFeedback] = useState<string>('');

  const canManage = !readOnly && !!currentUser && (currentUser.role === 'recruiter' || currentUser.role === 'placement');

  const startEdit = (round: InterviewRound) => {
    setEditingRoundId(round.id);
    setEditStatus(round.status);
    setEditFeedback(round.feedback || '');
  };

  const saveEdit = (round: InterviewRound) => {
    if (editStatus === 'Rejected') {
      setEditingRoundId(null);
      setRejectingRound(round);
      return;
    }

    StorageService.updateInterviewRound(application.id, round.id, {
      status: editStatus,
      feedback: editFeedback.trim() || undefined
    });

    showToast(`Updated round status to "${editStatus}". Candidate notified.`, 'success');
    setEditingRoundId(null);
    onUpdated();
  };

  const rounds = application.interviewRounds || [];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Interview Progress & Evaluation Pipeline
          </h4>
          <p className="text-[11px] text-slate-500">
            Overall Status: <strong className="text-slate-900">{application.status}</strong>
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Next Round</span>
          </button>
        )}
      </div>

      {/* Rounds List */}
      {rounds.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-slate-50">
          No interview rounds scheduled yet for this application.
          {canManage && (
            <p className="mt-1 text-slate-500">
              Click "Schedule Next Round" to initiate Round 1.
            </p>
          )}
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {rounds.map((round, index) => {
            const isEditing = editingRoundId === round.id;

            return (
              <div key={round.id} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[10px] font-bold font-mono ${
                  round.status === 'Selected'
                    ? 'border-emerald-500 text-emerald-600'
                    : round.status === 'Rejected'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-blue-500 text-blue-600'
                }`}>
                  {round.roundNumber}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {round.roundName}
                      </h5>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(round.dateTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {round.mode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={round.status} size="sm" />
                      {canManage && !isEditing && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(round)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Update round status & feedback"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {round.status !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => setRejectingRound(round)}
                              className="px-2 py-0.5 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                              title="Reject round with mandatory feedback"
                            >
                              Reject Round
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {round.meetingLinkOrVenue && (
                    <div className="p-2 bg-slate-50 border border-slate-200/80 rounded text-[11px] font-mono text-slate-700 flex items-center justify-between">
                      <span className="truncate">{round.meetingLinkOrVenue}</span>
                      {round.meetingLinkOrVenue.startsWith('http') && (
                        <a
                          href={round.meetingLinkOrVenue}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                        >
                          Open Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Feedback / Results View */}
                  {round.status === 'Rejected' ? (
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Round Rejection Outcome & Feedback</span>
                        </span>
                        {round.rejectionFeedback?.category && (
                          <span className="px-2 py-0.5 bg-white border border-rose-300 rounded text-[10px] text-rose-700 font-medium">
                            {round.rejectionFeedback.category}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                        "{round.rejectionFeedback?.feedback || round.feedback || 'No detailed feedback has been provided by the recruiter.'}"
                      </p>
                    </div>
                  ) : (
                    round.feedback && !isEditing && (
                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-0.5">
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wide">
                          Evaluation Remarks / Feedback:
                        </span>
                        <p className="text-slate-600 italic leading-relaxed">
                          "{round.feedback}"
                        </p>
                      </div>
                    )
                  )}

                  {/* In-place editor for recruiter/placement cell */}
                  {isEditing && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Round Status Result
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as InterviewRoundStatus)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white font-medium"
                          >
                            {ALL_STATUSES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Feedback / Score Remarks
                          </label>
                          <input
                            type="text"
                            value={editFeedback}
                            onChange={(e) => setEditFeedback(e.target.value)}
                            placeholder="e.g. Excellent problem solving in dynamic programming."
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setEditingRoundId(null)}
                          className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(round)}
                          className="px-3 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded shadow-2xs cursor-pointer"
                        >
                          {editStatus === 'Rejected' ? 'Continue to Rejection Feedback →' : 'Save Update & Notify Candidate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explicit Scheduling Notice footer */}
      <div className="text-[11px] text-slate-400 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
        💡 <strong>Recruitment Workflow Rule:</strong> Selection in Round {rounds.length} does not auto-create the next round. The talent team explicitly schedules each subsequent technical or HR round.
      </div>

      {scheduleModalOpen && (
        <InterviewScheduleModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          application={application}
          onScheduled={() => {
            onUpdated();
            setScheduleModalOpen(false);
          }}
        />
      )}

      {rejectingRound && (
        <RejectionFeedbackModal
          isOpen={!!rejectingRound}
          onClose={() => setRejectingRound(null)}
          application={application}
          interviewRound={rejectingRound}
          onSuccess={() => {
            onUpdated();
            setRejectingRound(null);
          }}
        />
      )}
    </div>
  );
};
