import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import { PlacementService } from '../services/placementService';
import { JobPost, JobType } from '../types';
import { JobPostModal } from '../components/placement/JobPostModal';
import { JobMatchingModal } from '../components/placement/JobMatchingModal';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  Send,
  Award,
  ChevronRight,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  UserCheck,
  ExternalLink
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
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
  const [filterCategory, setFilterCategory] = useState<'all' | 'eligible' | 'ineligible' | 'profile-incomplete' | 'applied' | 'closing-soon'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matchingJob, setMatchingJob] = useState<JobPost | null>(null);

  // Apply Modal state
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  const jobPosts = StorageService.getJobPosts();
  const applications = StorageService.getApplications();

  const hasApplied = (jobId: string) => {
    return applications.some(
      a => a.jobId === jobId && (
        a.studentId === currentUser.id ||
        (currentUser.rollNo && a.studentRollNo === currentUser.rollNo) ||
        (currentUser.email && (a as any).studentEmail === currentUser.email)
      )
    );
  };

  // Pre-calculate evaluation for all jobs for student to compute filter counts
  const jobEvaluations = useMemo(() => {
    const map = new Map<string, ReturnType<typeof PlacementService.evaluateCandidate>>();
    if (currentUser.role === 'student') {
      jobPosts.forEach(job => {
        map.set(job.id, PlacementService.evaluateCandidate(currentUser, job));
      });
    }
    return map;
  }, [jobPosts, currentUser, dataVersion]);

  // Compute category counts
  const counts = useMemo(() => {
    let eligible = 0;
    let ineligible = 0;
    let profileIncomplete = 0;
    let applied = 0;
    let closingSoon = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    jobPosts.forEach(job => {
      const isApp = hasApplied(job.id);
      if (isApp) applied++;

      const evalResult = jobEvaluations.get(job.id);
      if (evalResult) {
        if (evalResult.status === 'Eligible') eligible++;
        else if (evalResult.status === 'Ineligible') ineligible++;
        else if (evalResult.status === 'Profile Incomplete' || evalResult.status === 'Resume Required') profileIncomplete++;
      }

      // Check closing soon (within 30 days)
      if (job.applicationDeadline) {
        const deadlineDate = new Date(job.applicationDeadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          closingSoon++;
        }
      }
    });

    return {
      all: jobPosts.length,
      eligible,
      ineligible,
      profileIncomplete,
      applied,
      closingSoon
    };
  }, [jobPosts, jobEvaluations, applications, dataVersion]);

  const filteredJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return jobPosts.filter(job => {
      const matchSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'all' || job.jobType === selectedType;

      // Category filter
      let matchCategory = true;
      if (filterCategory === 'eligible') {
        const evalResult = jobEvaluations.get(job.id);
        matchCategory = evalResult?.status === 'Eligible';
      } else if (filterCategory === 'ineligible') {
        const evalResult = jobEvaluations.get(job.id);
        matchCategory = evalResult?.status === 'Ineligible';
      } else if (filterCategory === 'profile-incomplete') {
        const evalResult = jobEvaluations.get(job.id);
        matchCategory = evalResult?.status === 'Profile Incomplete' || evalResult?.status === 'Resume Required';
      } else if (filterCategory === 'applied') {
        matchCategory = hasApplied(job.id);
      } else if (filterCategory === 'closing-soon') {
        if (!job.applicationDeadline) matchCategory = false;
        else {
          const deadlineDate = new Date(job.applicationDeadline);
          const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          matchCategory = diffDays >= 0 && diffDays <= 30;
        }
      }

      return matchSearch && matchType && matchCategory;
    });
  }, [jobPosts, searchTerm, selectedType, filterCategory, jobEvaluations, applications, dataVersion]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    // Check mandatory eligibility first
    const evaluation = PlacementService.evaluateCandidate(currentUser, applyingJob);
    if (!evaluation.isEligible) {
      showToast(
        `Cannot apply: ${evaluation.explanation}`,
        'error'
      );
      return;
    }

    StorageService.applyForJob({
      jobId: applyingJob.id,
      studentId: currentUser.id,
      coverLetter: coverLetter.trim()
    });

    showToast(`Successfully applied to ${applyingJob.company} (${applyingJob.title})!`, 'success');
    setApplyingJob(null);
    setCoverLetter('');
  };

  const canPost = currentUser.role === 'recruiter' || currentUser.role === 'placement';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <span>Internship & Campus Placement Opportunities</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified campus drives, core tech engineering roles, and pre-placement internships. Eligibility is computed from your academic standing and uploaded resume.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Opportunity</span>
          </button>
        )}
      </div>

      {/* Main Filter Tabs (All, Eligible, Ineligible, Profile Incomplete, Applied, Closing Soon) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all' as const, label: 'All Opportunities', count: counts.all },
              ...(currentUser.role === 'student' ? [
                { id: 'eligible' as const, label: 'Eligible', count: counts.eligible },
                { id: 'ineligible' as const, label: 'Ineligible', count: counts.ineligible },
                { id: 'profile-incomplete' as const, label: 'Profile Incomplete', count: counts.profileIncomplete },
                { id: 'applied' as const, label: 'Applied', count: counts.applied }
              ] : []),
              { id: 'closing-soon' as const, label: 'Closing Soon', count: counts.closingSoon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  filterCategory === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{filteredJobs.length}</strong> openings
          </div>
        </div>

        {/* Search Bar & Job Type Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search role, company, or skills..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">Type:</span>
            {['all', 'Full-Time', 'Internship', 'Placement Drive'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl space-y-2">
            <p className="font-semibold text-slate-600 text-sm">No opportunities match your current filter selection.</p>
            <p className="text-[11px]">
              Try selecting "All Opportunities", clearing your search query, or checking other job categories.
            </p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const alreadyApplied = hasApplied(job.id);
            // Evaluate student eligibility & skill match separately
            const evaluation = currentUser.role === 'student'
              ? (jobEvaluations.get(job.id) || PlacementService.evaluateCandidate(currentUser, job))
              : null;

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {job.jobType}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {job.salaryPackage}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{job.title}</h3>
                      <p className="text-xs text-slate-600 font-medium">{job.company} · {job.location}</p>
                    </div>

                    {/* TWO SEPARATE INDICATORS: 1) Eligibility Status, 2) Skill Match Percentage */}
                    {evaluation && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Indicator 1: Eligibility Status */}
                        {evaluation.status === 'Eligible' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Eligible</span>
                          </span>
                        )}

                        {evaluation.status === 'Ineligible' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Ineligible</span>
                          </span>
                        )}

                        {evaluation.status === 'Profile Incomplete' && (
                          <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 transition-colors"
                          >
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Profile Incomplete</span>
                          </Link>
                        )}

                        {evaluation.status === 'Resume Required' && (
                          <Link
                            to="/resume-skills"
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Upload Resume to Check</span>
                          </Link>
                        )}

                        {/* Indicator 2: Skill Match Percentage */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          evaluation.skillMatchPercentage >= 70
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : evaluation.skillMatchPercentage >= 40
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{evaluation.skillMatchPercentage}% Skill Match</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>

                  {/* Skills badges: shows which skills match from resume */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Required Skills & Resume Match:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map(skill => {
                        const isPossessed = evaluation?.matchedSkills.includes(skill);
                        return (
                          <span 
                            key={skill} 
                            className={`px-2 py-0.5 rounded text-[11px] border ${
                              isPossessed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {isPossessed ? `✓ ${skill}` : skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Academic criteria breakdown */}
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] space-y-1.5 text-slate-600 border border-slate-200/80">
                    <div className="flex justify-between">
                      <span>Mandatory Min CGPA: <strong className="font-mono text-slate-900">{job.minCGPA.toFixed(2)}</strong></span>
                      <span>Graduation Batch: <strong className="font-mono text-slate-900">{job.graduationYear}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Eligible Depts: <strong>{job.eligibleDepartments.join(', ')}</strong>
                    </div>

                    {/* Clear Explanation / Ineligibility Reasons */}
                    {evaluation && (
                      <div className={`pt-2 border-t text-[11px] space-y-1 ${
                        evaluation.status === 'Eligible'
                          ? 'border-emerald-200 text-emerald-800'
                          : evaluation.status === 'Ineligible'
                          ? 'border-rose-200 text-rose-800'
                          : 'border-amber-200 text-amber-800'
                      }`}>
                        <div className="flex items-start gap-1.5 font-medium leading-snug">
                          {evaluation.status === 'Eligible' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                          {evaluation.status === 'Ineligible' && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                          {(evaluation.status === 'Profile Incomplete' || evaluation.status === 'Resume Required') && (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold mr-1">
                              {evaluation.status === 'Eligible' ? 'Eligibility Satisfied:' : 'Eligibility Notice:'}
                            </span>
                            <span>{evaluation.explanation}</span>
                          </div>
                        </div>

                        {evaluation.status === 'Resume Required' && (
                          <Link
                            to="/resume-skills"
                            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline pt-0.5"
                          >
                            <span>Go to Resume Upload →</span>
                          </Link>
                        )}

                        {evaluation.status === 'Profile Incomplete' && (
                          <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline pt-0.5"
                          >
                            <span>Go to Complete Profile Onboarding →</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Deadline: {job.applicationDeadline}
                  </span>

                  <div className="flex items-center gap-2">
                    {canPost && (
                      <button
                        onClick={() => setMatchingJob(job)}
                        className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Match Screener</span>
                      </button>
                    )}

                    {currentUser.role === 'student' && (
                      alreadyApplied ? (
                        <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (evaluation && !evaluation.isEligible) {
                              showToast(`Cannot apply: ${evaluation.explanation}`, 'error');
                              return;
                            }
                            setApplyingJob(job);
                          }}
                          disabled={!evaluation?.isEligible}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                            evaluation?.isEligible
                              ? 'text-white bg-purple-600 hover:bg-purple-700 cursor-pointer'
                              : 'text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {evaluation?.isEligible ? 'Apply Now' : evaluation?.status === 'Profile Incomplete' ? 'Complete Profile to Apply' : evaluation?.status === 'Resume Required' ? 'Upload Resume to Apply' : 'Ineligible to Apply'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Apply Modal for Students */}
      {applyingJob && (
        <Modal
          isOpen={!!applyingJob}
          onClose={() => setApplyingJob(null)}
          title={`Apply for ${applyingJob.title}`}
          subtitle={`${applyingJob.company} · Application Verification`}
          maxWidth="md"
        >
          <form onSubmit={handleApply} className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department & Batch:</span>
                <span className="font-semibold text-slate-800">{currentUser.department} ({currentUser.graduationYear})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cumulative CGPA:</span>
                <span className="font-mono font-bold text-slate-800">{currentUser.cgpa?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Resume:</span>
                <span className="font-mono text-blue-700 font-semibold truncate max-w-xs">
                  {currentUser.resume?.fileName || 'No Resume Uploaded'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statement of Interest / Cover Note (Optional)
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Highlight your relevant project engineering accomplishments or why you are a great fit for this position..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Submit Application</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Recruiter / Placement Modals */}
      {createModalOpen && (
        <JobPostModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => {
            setCreateModalOpen(false);
            showToast('Opportunity published to campus board!', 'success');
          }}
        />
      )}

      {matchingJob && (
        <JobMatchingModal
          isOpen={!!matchingJob}
          onClose={() => setMatchingJob(null)}
          job={matchingJob}
        />
      )}
    </div>
  );
};
