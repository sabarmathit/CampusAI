import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { JobPostModal } from '../placement/JobPostModal';
import { JobMatchingModal } from '../placement/JobMatchingModal';
import { ApplicationDetailModal } from '../placement/ApplicationDetailModal';
import { JobPost, Application } from '../../types';
import {
  Briefcase,
  Users,
  UserCheck,
  Video,
  Plus,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Award,
  Building2
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [matchingJob, setMatchingJob] = useState<JobPost | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const allJobs = StorageService.getJobPosts();
  // Filter for recruiter's company or postings
  const myJobs = allJobs.filter(j => 
    j.recruiterId === currentUser.id || j.company.toLowerCase().includes(currentUser.companyName?.toLowerCase() || '')
  );

  const allApplications = StorageService.getApplications();
  const myJobIds = new Set(myJobs.map(j => j.id));
  const myApplications = allApplications.filter(a => myJobIds.has(a.jobId));

  const shortlistedCandidates = myApplications.filter(
    a => a.status === 'Shortlisted' || a.status === 'Interviewing'
  );

  // Collect scheduled rounds
  const upcomingRounds: { round: any; app: Application }[] = [];
  myApplications.forEach(app => {
    (app.interviewRounds || []).forEach(r => {
      if (r.status === 'Scheduled' || r.status === 'In Progress') {
        upcomingRounds.push({ round: r, app });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-amber-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Talent Acquisition Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {currentUser.name} · {currentUser.companyName || 'NexaTech Systems'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-amber-200">
              Campus University Hiring Pipeline · Engineering Class of 2026
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCreateJobModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Role</span>
            </button>
            <button
              onClick={() => navigate('/applicants')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-white/15 hover:bg-white/20 rounded-lg transition-colors border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Users className="w-4 h-4" />
              <span>Candidate Pool</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Job Posts"
          value={myJobs.length}
          subtext="Live listings in student portal"
          icon={Briefcase}
          accentColor="amber"
          onClick={() => navigate('/recruiter/jobs')}
        />
        <StatCard
          label="Total Applicants"
          value={myApplications.length}
          subtext="Received candidate profiles"
          icon={Users}
          accentColor="blue"
          onClick={() => navigate('/applicants')}
        />
        <StatCard
          label="Shortlisted for Rounds"
          value={shortlistedCandidates.length}
          subtext="Screened & technical qualified"
          icon={UserCheck}
          accentColor="emerald"
          onClick={() => navigate('/applicants')}
        />
        <StatCard
          label="Upcoming Interviews"
          value={upcomingRounds.length}
          subtext="Scheduled rounds in calendar"
          icon={Video}
          accentColor="purple"
          onClick={() => navigate('/interviews')}
        />
      </div>

      {/* 3. Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
          Talent Operations:
        </span>
        <button
          onClick={() => setCreateJobModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-amber-600" />
          <span>Post Engineering Opening</span>
        </button>
        <button
          onClick={() => navigate('/applicants')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Screen Applicants</span>
        </button>
        <button
          onClick={() => navigate('/interviews')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5 text-purple-600" />
          <span>Manage Interview Rounds</span>
        </button>
      </div>

      {/* 4. Two-Column Layout: Job Postings & Match Screening + Recent Candidate Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: My Job Posts with Match Screener */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Your Company Openings & Match Screening
              </h3>
            </div>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-0.5"
            >
              All Roles <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {myJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active roles posted yet. Click "Post New Role" above.
              </div>
            ) : (
              myJobs.map(job => (
                <div
                  key={job.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-200 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium font-mono">{job.salaryPackage} · {job.location}</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold shrink-0">
                      Min CGPA: {job.minCGPA.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                    {job.requiredSkills.slice(0, 4).map(s => (
                      <span key={s} className="px-1.5 py-0.2 bg-white border border-slate-200 rounded">
                        {s}
                      </span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="px-1.5 py-0.2 text-slate-400">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Deadline: {job.applicationDeadline}
                    </span>
                    <button
                      onClick={() => setMatchingJob(job)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>View Matching Candidates</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Candidate Pipeline & Interview Progression */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Applicant Pipeline
              </h3>
            </div>
            <button
              onClick={() => navigate('/applicants')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
            >
              Candidate Pool <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {myApplications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No student applications received yet.
              </div>
            ) : (
              myApplications.slice(0, 4).map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                        {app.studentName} <span className="font-mono text-slate-500 font-normal">({app.studentRollNo})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">{app.jobTitle}</p>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-[11px] font-mono text-slate-600">
                      CGPA: <strong>{app.studentCGPA.toFixed(2)}</strong> · {app.studentDepartment.split(' ')[0]}
                    </span>
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">
                      Interview Timeline ({app.interviewRounds?.length || 0} rounds) →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Matching Modal */}
      {matchingJob && (
        <JobMatchingModal
          isOpen={!!matchingJob}
          onClose={() => setMatchingJob(null)}
          job={matchingJob}
          onApplicantUpdated={() => {}}
        />
      )}

      {/* New Job Modal */}
      <JobPostModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onCreated={() => {}}
      />

      {/* Application Detail & Interview Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
          application={selectedApplication}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};
