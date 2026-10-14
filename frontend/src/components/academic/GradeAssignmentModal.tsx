import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Assignment, Submission } from '../../types';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { FileText, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface GradeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submission: Submission | null;
  onGraded: () => void;
}

export const GradeAssignmentModal: React.FC<GradeAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  submission,
  onGraded
}) => {
  const { showToast } = useToast();

  const [marks, setMarks] = useState<number>(submission?.marksObtained || 45);
  const [feedback, setFeedback] = useState<string>(
    submission?.feedback || 'Well-structured implementation. Good handling of edge cases and clear documentation.'
  );

  if (!assignment || !submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (marks < 0 || marks > assignment.maxMarks) {
      showToast(`Marks must be between 0 and ${assignment.maxMarks}`, 'error');
      return;
    }

    StorageService.gradeSubmission(submission.id, Number(marks), feedback.trim());
    showToast(`Graded submission for ${submission.studentName}. Student notified.`, 'success');
    onGraded();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluate Student Submission"
      subtitle={`${assignment.title} (${assignment.subject})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student submission metadata */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">{submission.studentName}</span>
            <span className="text-slate-500 font-mono">Roll: {submission.studentRollNo}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Submitted: {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-slate-800">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate font-mono text-[11px]">{submission.fileName}</span>
            <span className="ml-auto text-[10px] text-emerald-600 font-semibold uppercase">Verified</span>
          </div>
          {submission.notes && (
            <div className="p-2 bg-white border border-slate-200 rounded text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-700 block mb-0.5">Student Notes:</span>
              {submission.notes}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Marks Awarded (Max: {assignment.maxMarks}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min={0}
              max={assignment.maxMarks}
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full pl-3 pr-14 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
              / {assignment.maxMarks}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Evaluation Feedback & Review Comments <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback on implementation architecture, methodology, and formatting..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Marks & Notify</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
