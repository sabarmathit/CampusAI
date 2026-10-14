import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { JobMatchingModal } from '../placement/JobMatchingModal';
import { JobPostModal } from '../placement/JobPostModal';
import { JobPost } from '../../types';
import {
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Video,
  Plus,
  BarChart3,
  ChevronRight
} from 'lucide-react';

export const PlacementDashboard: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const navigate = useNavigate();

  const [matchingJob, setMatchingJob] = useState<JobPost | null>(null);
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);

  const jobPosts = StorageService.getJobPosts();
  const applications = StorageService.getApplications();
  const studentUsers = allUsers.filter(u => u.role === 'student');

  // Metrics
  const eligibleStudentsCount = studentUsers.filter(s => (s.cgpa || 0) >= 7.5).length;
  const companies = Array.from(new Set(jobPosts.map(j => j.company)));
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interviewing');
  const selectedApps = applications.filter(a => a.status === 'Selected');

  // Department placement breakdown
  const deptStats = [
    { name: 'Computer Science & Engineering', placed: 3, total: 3, percentage: 100 },
    { name: 'Information Technology', placed: 1, total: 1, percentage: 100 },
    { name: 'Electronics & Communication', placed: 1, total: 1, percentage: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-purple-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Placement Operations Control Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {currentUser?.name || 'Placement Director'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-purple-200">
              {currentUser?.designation || 'Placement Officer'} · {currentUser?.officeLocation || 'Campus Placement Office'} · Season 2025–2026
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNewJobModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-purple-950 bg-purple-300 hover:bg-purple-200 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Placement Opening</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-white/15 hover:bg-white/20 rounded-lg transition-colors border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Placement Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Students"
          value={studentUsers.length}
          subtext={`${eligibleStudentsCount} eligible with CGPA ≥ 7.5`}
          icon={Users}
          accentColor="purple"
          onClick={() => navigate('/placement/students')}
        />
        <StatCard
          label="Partner Companies"
          value={companies.length}
          subtext={`${jobPosts.length} active drive openings`}
          icon={Building2}
          accentColor="blue"
          onClick={() => navigate('/placement/companies')}
        />
        <StatCard
          label="Total Applications"
          value={applications.length}
          subtext={`${shortlistedApps.length} shortlisted for rounds`}
          icon={FileCheck2}
          accentColor="amber"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          label="Offers / Selected"
          value={selectedApps.length}
          subtext="Offers confirmed this season"
          icon={CheckCircle2}
          accentColor="emerald"
          onClick={() => navigate('/applications')}
        />
      </div>

      {/* 3. Action Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
          Operations Control:
        </span>
        <button
          onClick={() => navigate('/opportunities')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
          <span>Review All Drives</span>
        </button>
        <button
          onClick={() => navigate('/interviews')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5 text-blue-600" />
          <span>Interviews Tracker</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Placement Statistics & Salary Tiers</span>
        </button>
      </div>

      {/* 4. Two-Column Layout: Active Placement Drives with Candidate Match Engine + Placement Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Drives & Instant Candidate Match Screener */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Active Drives & Candidate Matching
              </h3>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-0.5"
            >
              All Openings <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {jobPosts.slice(0, 3).map(job => (
              <div
                key={job.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-200 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">{job.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{job.company} · {job.salaryPackage}</p>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 shrink-0 font-bold">
                    Min CGPA: {job.minCGPA.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Deadline: {job.applicationDeadline}
                  </span>
                  <button
                    onClick={() => setMatchingJob(job)}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Run Match Screener</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Placement Department Progress & Salary Benchmark Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Department Offer Statistics
              </h3>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Export CSV →
            </button>
          </div>

          <div className="space-y-4">
            {deptStats.map(stat => (
              <div key={stat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate">{stat.name}</span>
                  <span className="font-mono text-slate-600">
                    <strong className="text-slate-900">{stat.placed}</strong> / {stat.total} Placed ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Salary Package Summary Box */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase block">Highest CTC Offer</span>
              <p className="mt-0.5 text-base font-bold font-mono text-emerald-700">₹21.0 LPA</p>
              <p className="text-[10px] text-slate-500">CloudScale Global</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase block">Average CTC Offer</span>
              <p className="mt-0.5 text-base font-bold font-mono text-slate-900">₹15.8 LPA</p>
              <p className="text-[10px] text-slate-500">Tier-1 Core Engineering</p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Engine Modal */}
      {matchingJob && (
        <JobMatchingModal
          isOpen={!!matchingJob}
          onClose={() => setMatchingJob(null)}
          job={matchingJob}
        />
      )}

      {/* New Job Modal */}
      <JobPostModal
        isOpen={newJobModalOpen}
        onClose={() => setNewJobModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
};
