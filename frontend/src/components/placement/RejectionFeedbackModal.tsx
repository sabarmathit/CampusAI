import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RejectionCategory, Application, InterviewRound } from '../../types';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Send, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RejectionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  interviewRound?: InterviewRound | null;
  onSuccess: () => void;
}

const REJECTION_CATEGORIES: RejectionCategory[] = [
  'Skills mismatch',
  'Insufficient technical knowledge',
  'Communication skills',
  'Coding/technical assessment performance',
  'Experience mismatch',
  'Eligibility criteria not met',
  'Interview performance',
  'Other'
];

export const RejectionFeedbackModal: React.FC<RejectionFeedbackModalProps> = ({
  isOpen,
  onClose,
  application,
  interviewRound,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [category, setCategory] = useState<RejectionCategory>('Skills mismatch');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const validateFeedback = (): boolean => {
    if (!feedback.trim()) {
      setError('Detailed constructive feedback is mandatory so the student understands areas for improvement.');
      return false;
    }
    if (feedback.trim().length < 10) {
      setError('Please provide at least 10 characters of specific feedback.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFeedback()) return;
    setConfirmStep(true);
  };

  const handleFinalSubmit = () => {
    if (!currentUser || isSubmitting) return;
    if (!validateFeedback()) {
      setConfirmStep(false);
      return;
    }

    setIsSubmitting(true);
    try {
      if (interviewRound) {
        // Round-specific rejection
        StorageService.rejectInterviewRound(application.id, interviewRound.id, {
          recruiterId: currentUser.id,
          recruiterName: currentUser.name,
          category,
          feedback: feedback.trim()
        });
        showToast(
          `Candidate rejected for ${interviewRound.roundName}. Detailed feedback recorded and student notified.`,
          'info'
        );
      } else {
        // Direct application rejection
        StorageService.rejectApplication(application.id, {
          recruiterId: currentUser.id,
          recruiterName: currentUser.name,
          category,
          feedback: feedback.trim()
        });
        showToast(
          `Application for ${application.studentName} marked as Rejected. Recruiter feedback saved and candidate notified.`,
          'info'
        );
      }

      setFeedback('');
      setCategory('Skills mismatch');
      setConfirmStep(false);
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rejection feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          setConfirmStep(false);
          setError(null);
          onClose();
        }
      }}
      title={interviewRound ? `Reject Interview: ${interviewRound.roundName}` : 'Reject Candidate Application'}
      subtitle={`${application.company} · ${application.jobTitle}`}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Context Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{application.studentName}</span>
            <span className="font-mono text-slate-500">{application.studentRollNo}</span>
          </div>
          <p className="text-slate-600">
            Role: <strong>{application.jobTitle}</strong> ({application.company})
          </p>
          {interviewRound && (
            <p className="text-blue-700 font-medium">
              Target Evaluation Round: <strong>{interviewRound.roundName}</strong>
            </p>
          )}
        </div>

        {/* Warning Callout */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Mandatory Feedback Policy:</strong> In line with campus placement guidelines, students must receive specific, constructive feedback explaining why their application or round was rejected to assist their career preparation.
          </div>
        </div>

        {!confirmStep ? (
          <form onSubmit={handleProceedToReview} className="space-y-4">
            {/* Reason Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Reason Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RejectionCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
              >
                {REJECTION_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Categorizes the core domain where the candidate did not meet benchmarks.
              </p>
            </div>

            {/* Detailed Feedback */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Constructive Feedback <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Detail technical concepts, problem-solving gaps, or specific requirements that were missing (e.g. 'Demonstrated good basics in JavaScript, but lacked depth in asynchronous event loops and PostgreSQL indexing optimization for high concurrency.')."
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                  error ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500' : 'border-slate-200 focus:ring-rose-500'
                }`}
              />
              {error ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  This exact feedback will be delivered to the student's notification center and application portal.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review & Confirm Rejection</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation & Review Step */
          <div className="space-y-4">
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Confirm Final Rejection Details</span>
              </div>
              <p className="text-slate-600">
                Please verify the feedback below before submitting. Once confirmed, the candidate's status will update to <strong className="text-rose-700">Rejected</strong> and an automated notification will be delivered immediately.
              </p>

              <div className="pt-2 border-t border-rose-200/60 space-y-1.5">
                <div>
                  <span className="font-semibold text-slate-700">Reason Category:</span>{' '}
                  <span className="px-2 py-0.5 bg-white border border-rose-200 rounded text-rose-800 font-medium">
                    {category}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Recruiter Feedback Statement:</span>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                    "{feedback.trim()}"
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-rose-600 font-medium">{error}</p>
            )}

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmStep(false)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                ← Back to Edit
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Saving Rejection...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Rejection & Notify Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
