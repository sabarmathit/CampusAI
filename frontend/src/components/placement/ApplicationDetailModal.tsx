import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { InterviewRoundTimeline } from './InterviewRoundTimeline';
import { RejectionFeedbackModal } from './RejectionFeedbackModal';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, Award, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onUpdated: () => void;
  readOnly?: boolean;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdated,
  readOnly = false
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  if (!application) return null;

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (newStatus === 'Rejected') {
      setRejectModalOpen(true);
      return;
    }
    StorageService.updateApplicationStatus(application.id, newStatus);
    showToast(`Candidate status updated to "${newStatus}". Notification sent to candidate.`, 'success');
    onUpdated();
  };

  const handleWithdraw = () => {
    if (window.confirm(`Are you sure you want to withdraw your application for ${application.company} (${application.jobTitle})?`)) {
      StorageService.withdrawApplication(application.id);
      showToast('Application withdrawn successfully.', 'info');
      onUpdated();
      onClose();
    }
  };

  const canWithdraw = currentUser?.role === 'student' && (application.status === 'Applied' || application.status === 'Shortlisted');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${application.jobTitle}`}
        subtitle={`${application.company} · Application ID: ${application.id}`}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Candidate & Job Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{application.studentName}</span>
                <span className="text-xs text-slate-500 font-mono">({application.studentRollNo})</span>
                <StatusBadge status={application.status} size="sm" />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                <span>CGPA: <strong>{application.studentCGPA.toFixed(2)}</strong></span>
                <span>·</span>
                <span>Applied: <strong>{application.appliedDate}</strong></span>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <p><strong>Department:</strong> {application.studentDepartment}</p>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500 mr-1">Skills:</span>
              {application.studentSkills.map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                  {skill}
                </span>
              ))}
            </div>

            {application.coverLetter && (
              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-0.5">Candidate Note:</span>
                <p className="italic">"{application.coverLetter}"</p>
              </div>
            )}
          </div>

          {/* Rejection Feedback Card (Visible to Student, Recruiter, Placement Cell) */}
          {application.status === 'Rejected' && (
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <h4 className="font-bold uppercase tracking-wider text-rose-900 text-xs">
                    Recruiter Evaluation & Rejection Feedback
                  </h4>
                </div>
                {application.rejectionFeedback?.rejectedAt && (
                  <span className="text-[11px] font-mono text-rose-700">
                    {new Date(application.rejectionFeedback.rejectedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>

              {application.rejectionFeedback ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-slate-600">
                    <span>Company: <strong>{application.company}</strong></span>
                    <span>·</span>
                    <span>Role: <strong>{application.jobTitle}</strong></span>
                    {application.rejectionFeedback.roundName && (
                      <>
                        <span>·</span>
                        <span className="text-rose-700">Round: <strong>{application.rejectionFeedback.roundName}</strong></span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-700 font-semibold">Rejection Reason Category:</span>
                    <span className="px-2 py-0.5 bg-white border border-rose-300 rounded font-medium text-rose-800 text-[11px]">
                      {application.rejectionFeedback.category}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-slate-700 block">Detailed Recruiter Feedback:</span>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                      "{application.rejectionFeedback.feedback}"
                    </div>
                  </div>

                  {/* Structured Suggested Areas for Improvement */}
                  <div className="pt-2 border-t border-rose-200/60">
                    <span className="font-semibold text-[11px] text-slate-800 block mb-1">
                      Suggested Areas for Improvement:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                      <li>Focus on improving benchmark skills in <strong>{application.rejectionFeedback.category}</strong>.</li>
                      <li>Review the recruiter's remarks above to target preparation before the next placement drive.</li>
                      <li>Upload an updated resume in <strong>My Resume & Skills</strong> with projects evidencing these competencies.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic py-1">
                  No detailed feedback has been provided by the recruiter.
                </p>
              )}
            </div>
          )}

          {/* Recruiter / Placement Officer Status Manager Toolbar */}
          {!readOnly && (currentUser?.role === 'recruiter' || currentUser?.role === 'placement') && (
            <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-purple-900">Application Pipeline Status:</span>
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                  className="px-3 py-1.5 text-xs font-semibold border border-purple-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                >
                  <option value="Applied">Applied (Screening Stage)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted for Assessment</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interviewing">Interviewing (Rounds Active)</option>
                  <option value="Selected">Selected / Offer Extended</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {application.status !== 'Shortlisted' && application.status !== 'Selected' && application.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Shortlisted')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-white hover:bg-purple-100 border border-purple-300 rounded-md transition-colors cursor-pointer"
                  >
                    Quick Shortlist
                  </button>
                )}
                {application.status !== 'Selected' && application.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Selected')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-md transition-colors cursor-pointer"
                  >
                    Extend Offer
                  </button>
                )}
                {application.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-md transition-colors cursor-pointer"
                  >
                    Reject with Feedback
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Integrated Interview Round Tracking Section */}
          <div className="pt-2">
            <InterviewRoundTimeline
              application={application}
              onUpdated={onUpdated}
              readOnly={readOnly}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {canWithdraw && (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Withdraw Application</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </Modal>

      {/* Mandatory Rejection Feedback Modal */}
      <RejectionFeedbackModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        application={application}
        onSuccess={() => {
          onUpdated();
        }}
      />
    </>
  );
};
