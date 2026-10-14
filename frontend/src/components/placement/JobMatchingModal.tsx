import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { JobPost, Application } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { PlacementService, CandidateMatchResult } from '../../services/placementService';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  AlertOctagon, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface JobMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPost | null;
  onApplicantUpdated?: () => void;
}

export const JobMatchingModal: React.FC<JobMatchingModalProps> = ({
  isOpen,
  onClose,
  job,
  onApplicantUpdated
}) => {
  const { allUsers } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');

  const { eligible, ineligible } = useMemo(() => {
    if (!job) return { eligible: [], ineligible: [] };
    const applications = StorageService.getApplications();
    return PlacementService.matchAllStudentsForJob(allUsers, job, applications);
  }, [allUsers, job]);

  if (!job) return null;

  const applications = StorageService.getApplications();

  const handleShortlistCandidate = (match: CandidateMatchResult) => {
    // Check if application exists
    let app = applications.find(a => a.jobId === job.id && a.studentId === match.student.id);

    if (!app) {
      // Create application and set to Shortlisted
      app = StorageService.applyForJob({
        jobId: job.id,
        studentId: match.student.id,
        coverLetter: `Candidate auto-screened with ${match.skillMatchPercentage}% skill match for ${job.title}.`
      });
    }

    StorageService.updateApplicationStatus(app.id, 'Shortlisted');
    showToast(`Candidate ${match.student.name} marked as Shortlisted! Student notified.`, 'success');
    if (onApplicantUpdated) onApplicantUpdated();
  };

  const getApplicationStatus = (studentId: string) => {
    const app = applications.find(a => a.jobId === job.id && a.studentId === studentId);
    return app ? app.status : 'Not Applied';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Candidate Matching & Screening Engine"
      subtitle={`${job.title} · ${job.company}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Job Requirement Bar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">Mandatory Benchmarks:</span>
            <div className="flex items-center gap-3 font-mono text-slate-600">
              <span>Min CGPA: <strong>{job.minCGPA.toFixed(2)}</strong></span>
              <span>·</span>
              <span>Batch: <strong>{job.graduationYear}</strong></span>
              <span>·</span>
              <span>Package: <strong>{job.salaryPackage}</strong></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 text-[11px]">
            <span className="text-slate-500 mr-1">Required Skills:</span>
            {job.requiredSkills.map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('eligible')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'eligible'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Eligible Candidates ({eligible.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ineligible'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ineligible Candidates ({ineligible.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Rule: Skill-match cannot bypass mandatory criteria
          </span>
        </div>

        {/* Tab 1: Eligible Candidates */}
        {activeTab === 'eligible' && (
          <div className="space-y-3">
            {eligible.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                No students meet all mandatory criteria (CGPA $\ge$ {job.minCGPA}, eligible department, and graduation year {job.graduationYear}).
              </div>
            ) : (
              eligible.map(match => {
                const appStatus = getApplicationStatus(match.student.id);
                return (
                  <div
                    key={match.student.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-900 text-xs">{match.student.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {(match.student as any).rollNo || '21CS104'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Eligible
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          CGPA: {match.student.cgpa?.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">{match.student.department}</p>

                      {/* Skill Match Breakdown */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">Skill Match:</span>
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                            match.skillMatchPercentage >= 80 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : match.skillMatchPercentage >= 50 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {match.skillMatchPercentage}%
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {match.matchedSkills.map(skill => (
                            <span key={skill} className="px-1.5 py-0.2 text-[10px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                              ✓ {skill}
                            </span>
                          ))}
                          {match.missingSkills.map(skill => (
                            <span key={skill} className="px-1.5 py-0.2 text-[10px] bg-slate-50 text-slate-400 rounded border border-slate-200">
                              ✕ {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-slate-500 mr-2">
                        Status: <strong className="text-slate-800">{appStatus}</strong>
                      </span>
                      {appStatus !== 'Shortlisted' && appStatus !== 'Interviewing' && appStatus !== 'Selected' && (
                        <button
                          type="button"
                          onClick={() => handleShortlistCandidate(match)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Shortlist</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Ineligible Candidates */}
        {activeTab === 'ineligible' && (
          <div className="space-y-3">
            {ineligible.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                All candidates in student registry meet the criteria!
              </div>
            ) : (
              ineligible.map(match => (
                <div
                  key={match.student.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-700 text-xs">{match.student.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {(match.student as any).rollNo || '21CS100'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Disqualified
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        CGPA: {match.student.cgpa?.toFixed(2) || 'N/A'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">{match.student.department}</p>

                    {/* Disqualification Reasons */}
                    <div className="space-y-0.5 pt-1">
                      {match.ineligibilityReasons.map((reason, idx) => (
                        <p key={idx} className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 shrink-0" />
                          {reason}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span>Skill Match: <strong>{match.skillMatchPercentage}%</strong></span>
                      <span className="text-slate-400">(Skill match cannot override mandatory criteria)</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 italic">Cannot Shortlist</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Close Engine
          </button>
        </div>
      </div>
    </Modal>
  );
};
