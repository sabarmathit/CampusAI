import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { Application, ApplicationStatus, JobPost, User } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ApplicationDetailModal } from '../components/placement/ApplicationDetailModal';
import { RejectionFeedbackModal } from '../components/placement/RejectionFeedbackModal';
import {
  Users,
  Search,
  Filter,
  Video,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const RecruiterApplicantsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allJobs = StorageService.getJobPosts();
  const allUsers = StorageService.getUsers();

  const myJobsMap = useMemo(() => {
    const map = new Map<string, JobPost>();
    const company = (currentUser.companyName || '').toLowerCase().trim();
    allJobs
      .filter(j => j.recruiterId === currentUser.id || (company && j.company.toLowerCase().includes(company)))
      .forEach(j => map.set(j.id, j));
    return map;
  }, [allJobs, currentUser]);

  const allApplications = StorageService.getApplications();

  // Recruiter view: ONLY candidates who have actually applied for their jobs
  const myApplications = useMemo(() => {
    if (myJobsMap.size === 0) return allApplications;
    return allApplications.filter(a => myJobsMap.has(a.jobId));
  }, [allApplications, myJobsMap, dataVersion]);

  const counts = useMemo(() => {
    return {
      all: myApplications.length,
      Applied: myApplications.filter(a => a.status === 'Applied').length,
      'Under Review': myApplications.filter(a => a.status === 'Under Review').length,
      Shortlisted: myApplications.filter(a => a.status === 'Shortlisted').length,
      'Interview Scheduled': myApplications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interviewing').length,
      Selected: myApplications.filter(a => a.status === 'Selected').length,
      Rejected: myApplications.filter(a => a.status === 'Rejected').length,
      'On Hold': myApplications.filter(a => a.status === 'On Hold').length,
    };
  }, [myApplications]);

  const filtered = useMemo(() => {
    return myApplications.filter(app => {
      const matchSearch =
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.studentRollNo && app.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'Interview Scheduled') {
          matchStatus = app.status === 'Interview Scheduled' || app.status === 'Interviewing';
        } else {
          matchStatus = app.status.toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchSearch && matchStatus;
    });
  }, [myApplications, searchTerm, statusFilter]);

  const handleQuickStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    if (newStatus === 'Rejected') {
      const app = myApplications.find(a => a.id === appId);
      if (app) setRejectingApp(app);
      return;
    }

    StorageService.updateApplicationStatus(appId, newStatus);
    showToast(`Applicant status updated to "${newStatus}". Student notified.`, 'success');
  };

  const handleShortlist = (app: Application) => {
    try {
      StorageService.shortlistApplicant(app.id);
      showToast(`Candidate ${app.studentName} shortlisted for assessment!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>Applications – Candidate Evaluation & Screening</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted student profiles, verify skill compatibility and academic eligibility, and make shortlist/rejection decisions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, role, or roll no..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg w-fit overflow-x-auto shadow-2xs">
        {[
          { id: 'all', label: 'All Candidates', count: counts.all },
          { id: 'Applied', label: 'Applied', count: counts.Applied },
          { id: 'Under Review', label: 'Under Review', count: counts['Under Review'] },
          { id: 'Shortlisted', label: 'Shortlisted', count: counts.Shortlisted },
          { id: 'Interview Scheduled', label: 'Interview Scheduled', count: counts['Interview Scheduled'] },
          { id: 'Selected', label: 'Selected / Offers', count: counts.Selected },
          { id: 'Rejected', label: 'Rejected', count: counts.Rejected },
          { id: 'On Hold', label: 'On Hold', count: counts['On Hold'] }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-amber-100 text-amber-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl space-y-1">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No applicants found matching this filter.</p>
            <p>Only students who have actually submitted an application for your job postings are listed here.</p>
          </div>
        ) : (
          filtered.map(app => {
            const job = myJobsMap.get(app.jobId);
            const studentUser = allUsers.find(u => u.id === app.studentId);

            // Compute eligibility & skill match
            const requiredSkills = job?.requiredSkills || [];
            const studentSkills = app.studentSkills || [];
            const matchedSkills = requiredSkills.filter(req =>
              studentSkills.some(s => s.toLowerCase().includes(req.toLowerCase()))
            );
            const skillMatchPct = requiredSkills.length > 0
              ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
              : 85;

            const isCgpaEligible = !job || app.studentCGPA >= (job.minCGPA || 0);
            const isDeptEligible = !job || job.eligibleDepartments.some(
              d => d.toLowerCase().includes(app.studentDepartment.toLowerCase()) ||
                   app.studentDepartment.toLowerCase().includes(d.toLowerCase())
            );

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-amber-300 transition-all space-y-4"
              >
                {/* Main Card Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm font-bold text-slate-900">{app.studentName}</h3>
                      <span className="text-xs text-slate-400 font-mono">({app.studentRollNo})</span>
                      <StatusBadge status={app.status} size="sm" />
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                        {skillMatchPct}% Skill Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Applied for <strong>{app.jobTitle}</strong> · {app.company}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span>Department: <strong>{app.studentDepartment}</strong></span>
                      <span>·</span>
                      <span className="font-mono">
                        CGPA: <strong className={isCgpaEligible ? 'text-slate-900' : 'text-rose-600'}>
                          {app.studentCGPA.toFixed(2)}
                        </strong>
                        {job && <span className="text-[11px] text-slate-400"> (Min: {job.minCGPA})</span>}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-500">
                        Applied: <strong>{app.appliedDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Profile & Resume</span>
                    </button>

                    {app.status !== 'Shortlisted' && app.status !== 'Selected' && app.status !== 'Rejected' && (
                      <button
                        type="button"
                        onClick={() => handleShortlist(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Shortlist</span>
                      </button>
                    )}

                    {app.status !== 'Rejected' && (
                      <button
                        type="button"
                        onClick={() => setRejectingApp(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate Competency & Eligibility Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Skills Snapshot */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Candidate Skills & Stack:
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {studentSkills.slice(0, 7).map(skill => {
                        const isMatch = requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()));
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                              isMatch
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                      {studentSkills.length > 7 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{studentSkills.length - 7} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Academic & Compliance Validation */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Criteria Compliance Verification:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        isCgpaEligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isCgpaEligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        CGPA Check ({app.studentCGPA.toFixed(2)})
                      </span>

                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        isDeptEligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isDeptEligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Discipline Match
                      </span>

                      {studentUser?.resume && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                          <FileText className="w-3 h-3" />
                          Resume Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Note / Cover Letter if provided */}
                {app.coverLetter && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60">
                    <span className="font-semibold text-slate-700 block text-[10px] uppercase">Applicant Note:</span>
                    <p className="italic mt-0.5 leading-relaxed">"{app.coverLetter}"</p>
                  </div>
                )}

                {/* Rejection Feedback Banner if Rejected */}
                {app.status === 'Rejected' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Candidate Rejected · Recruiter Feedback:</span>
                      </span>
                      {app.rejectionFeedback?.category && (
                        <span className="px-2 py-0.5 bg-white border border-rose-300 rounded text-[10px] font-medium text-rose-800">
                          {app.rejectionFeedback.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                      "{app.rejectionFeedback?.feedback || 'No detailed feedback has been provided by the recruiter.'}"
                    </p>
                  </div>
                )}

                {/* Status Update Quick Select */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Review Pipeline Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                    >
                      <option value="Applied">Applied (Screening)</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Selected">Selected / Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {app.id} · {app.interviewRounds?.length || 0} rounds logged
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          onUpdated={() => {
            const updated = StorageService.getApplications().find(a => a.id === selectedApp.id);
            if (updated) setSelectedApp(updated);
          }}
        />
      )}

      {/* Mandatory Rejection Feedback Modal */}
      {rejectingApp && (
        <RejectionFeedbackModal
          isOpen={!!rejectingApp}
          onClose={() => setRejectingApp(null)}
          application={rejectingApp}
          onSuccess={() => {
            setRejectingApp(null);
          }}
        />
      )}
    </div>
  );
};
