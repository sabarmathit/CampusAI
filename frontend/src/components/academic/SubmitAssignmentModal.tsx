import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Assignment, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { FileUp, Paperclip, Calendar, Award } from 'lucide-react';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  existingSubmission?: Submission;
  onSubmitted: () => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  onSubmitted
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [fileName, setFileName] = useState(
    existingSubmission?.fileName || (currentUser ? `${currentUser.name.replace(/\s+/g, '_')}_Lab_Submission.pdf` : 'Submission.pdf')
  );
  const [notes, setNotes] = useState(existingSubmission?.notes || '');
  const [fileSimulated, setFileSimulated] = useState(true);

  if (!assignment || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!fileName.trim()) {
      showToast('Please provide a submission file name or upload file', 'error');
      return;
    }

    StorageService.submitAssignment({
      assignmentId: assignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentRollNo: (currentUser as any).rollNo || '21CS104',
      fileName: fileName.trim(),
      notes: notes.trim()
    });

    showToast(`Successfully submitted "${assignment.title}". Faculty notified for review.`, 'success');
    onSubmitted();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingSubmission ? 'Update Assignment Submission' : 'Submit Assignment'}
      subtitle={`${assignment.subject} · Created by ${assignment.facultyName}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Assignment brief summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">{assignment.title}</span>
            <span className="text-slate-500 flex items-center gap-1 font-mono">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              {assignment.maxMarks} Marks
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{assignment.description}</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due: {assignment.dueDate}
            </span>
            {assignment.attachmentName && (
              <span className="flex items-center gap-1 text-blue-600">
                <Paperclip className="w-3.5 h-3.5" />
                {assignment.attachmentName}
              </span>
            )}
          </div>
        </div>

        {existingSubmission?.status === 'graded' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-emerald-800">
              Graded: {existingSubmission.marksObtained} / {assignment.maxMarks} Marks
            </p>
            {existingSubmission.feedback && (
              <p className="text-emerald-700 italic">Faculty Feedback: "{existingSubmission.feedback}"</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Submission Artifact / Source File <span className="text-rose-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileUp className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-xs font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full"
                    placeholder="FileName_Report.pdf"
                  />
                  <p className="text-[10px] text-slate-400">PDF, ZIP, or DOCX (Max 25MB)</p>
                </div>
              </div>
              <label className="cursor-pointer px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 shrink-0">
                Browse
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                      setFileSimulated(false);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Notes / GitHub Repository Link (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Include repository URL, testing notes, execution instructions, or comments for the faculty reviewer..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {existingSubmission ? 'Update Submission' : 'Submit for Grading'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
