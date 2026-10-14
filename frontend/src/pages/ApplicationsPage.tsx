import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { Application, ApplicationStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ApplicationDetailModal } from '../components/placement/ApplicationDetailModal';
import { Link, useLocation } from 'react-router-dom';
import {
  FileCheck2,
  Building2,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Video,
  Clock,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight,
  XCircle
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const location = useLocation();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const allApplications = StorageService.getApplications();

  // If student, match for own applications resiliently by studentId, rollNo, or email
  const applications = useMemo(() => {
    if (currentUser.role === 'student') {
      return allApplications.filter(a => 
        a.studentId === currentUser.id ||
        (currentUser.rollNo && a.studentRollNo === currentUser.rollNo) ||
        (currentUser.email && (a as any).studentEmail === currentUser.email)
      );
    }
    return allApplications;
  }, [allApplications, currentUser, dataVersion]);

  // Handle direct navigation via notification (e.g. ?appId=app-06)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetAppId = params.get('appId');
    if (targetAppId && applications.length > 0) {
      const match = applications.find(a => a.id === targetAppId);
      if (match) setSelectedApp(match);
    }
  }, [location.search, applications]);

  // Compute status counts
  const counts = useMemo(() => {
    return {
      all: applications.length,
      Applied: applications.filter(a => a.status === 'Applied').length,
      Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      Interviewing: applications.filter(a => a.status === 'Interviewing').length,
      Selected: applications.filter(a => a.status === 'Selected').length,
      Rejected: applications.filter(a => a.status === 'Rejected').length,
    };
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchSearch =
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.studentRollNo && app.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (statusFilter !== 'all') {
        matchStatus = app.status.toLowerCase() === statusFilter.toLowerCase();
      }

      return matchSearch && matchStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleWithdraw = (e: React.MouseEvent, app: Application) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to withdraw your application for ${app.company} (${app.jobTitle})?`)) {
      StorageService.withdrawApplication(app.id);
      showToast('Application withdrawn successfully.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>
              {currentUser.role === 'student' ? 'My Campus Applications & Interview Progress' : 'Central Applications & Interview Roster'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-round recruitment tracking, schedules, venue links, and offer outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {applications.length} Applied Total
          </span>
          {currentUser.role === 'student' && (
            <Link
              to="/opportunities"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Explore More Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'all', label: 'All Applications', count: counts.all },
            { id: 'Applied', label: 'Applied', count: counts.Applied },
            { id: 'Shortlisted', label: 'Shortlisted', count: counts.Shortlisted },
            { id: 'Interviewing', label: 'Interviewing', count: counts.Interviewing },
            { id: 'Selected', label: 'Selected / Offers', count: counts.Selected },
            { id: 'Rejected', label: 'Rejected', count: counts.Rejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, role, or student..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <strong>{filteredApps.length}</strong> matching applications
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No applications match your current filter.</p>
            <p className="text-[11px] text-slate-400">
              {currentUser.role === 'student' 
                ? 'Check "All Applications" tab or visit the Opportunities portal to discover and apply for campus drives.'
                : 'No student candidates found under this specific status filter.'}
            </p>
            {currentUser.role === 'student' && (
              <div className="pt-2">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                >
                  Browse Campus Opportunities →
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredApps.map(app => {
            const rounds = app.interviewRounds || [];
            const latestRound = rounds[rounds.length - 1];
            const canWithdraw = currentUser.role === 'student' && (app.status === 'Applied' || app.status === 'Shortlisted');

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900">{app.company}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">{app.jobTitle}</span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Candidate: <strong className="text-slate-800">{app.studentName}</strong> ({app.studentRollNo})</span>
                    <span>·</span>
                    <span>CGPA: <strong className="font-mono text-slate-800">{app.studentCGPA.toFixed(2)}</strong></span>
                    <span>·</span>
                    <span>Applied: <strong className="font-mono text-slate-600">{app.appliedDate}</strong></span>
                  </div>

                  {/* Rejection Feedback Strip if Rejected */}
                  {app.status === 'Rejected' && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-rose-800 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Application Rejected · Recruiter Feedback Available</span>
                        </span>
                        {app.rejectionFeedback?.category && (
                          <span className="px-2 py-0.5 bg-white border border-rose-300 rounded text-[10px] text-rose-700 font-medium">
                            {app.rejectionFeedback.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-700 italic">
                        "{app.rejectionFeedback?.feedback || 'Click to view full application and round evaluation details.'}"
                      </p>
                    </div>
                  )}

                  {/* Active/Latest Interview Round Status Strip */}
                  {app.status !== 'Rejected' && (latestRound ? (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          {latestRound.roundName}
                        </span>
                        <StatusBadge status={latestRound.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Date: {new Date(latestRound.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · Mode: {latestRound.mode}
                      </p>
                      {latestRound.feedback && (
                        <p className="text-[11px] text-slate-600 italic border-t border-slate-200/60 pt-1 mt-1">
                          Feedback: "{latestRound.feedback}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Application submitted. Profile is under screening review by {app.company} talent team.
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  {canWithdraw && (
                    <button
                      type="button"
                      onClick={(e) => handleWithdraw(e, app)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Withdraw your submitted application"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Withdraw</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Rounds ({rounds.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Application Detail & Interview Tracking Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          onUpdated={() => {
            const updated = StorageService.getApplications().find(a => a.id === selectedApp.id);
            if (updated) setSelectedApp(updated);
          }}
          readOnly={currentUser.role === 'student'}
        />
      )}
    </div>
  );
};
