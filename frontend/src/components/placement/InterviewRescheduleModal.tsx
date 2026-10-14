import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Application, InterviewRound } from '../../types';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

interface InterviewRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  round: InterviewRound;
  onSuccess: () => void;
}

export const InterviewRescheduleModal: React.FC<InterviewRescheduleModalProps> = ({
  isOpen,
  onClose,
  application,
  round,
  onSuccess
}) => {
  const { showToast } = useToast();

  const [newDateTime, setNewDateTime] = useState(
    round.dateTime ? round.dateTime.substring(0, 16) : new Date().toISOString().substring(0, 16)
  );
  const [mode, setMode] = useState<InterviewRound['mode']>(round.mode || 'Online (Google Meet)');
  const [meetingLinkOrVenue, setMeetingLinkOrVenue] = useState(round.meetingLinkOrVenue || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateTime) {
      showToast('Please select a valid new date and time.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      StorageService.rescheduleInterviewRound(application.id, round.id, {
        newDateTime,
        mode,
        meetingLinkOrVenue: meetingLinkOrVenue.trim() || undefined,
        notes: notes.trim() || undefined
      });

      showToast(`Interview round "${round.roundName}" rescheduled. Candidate notified.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to reschedule interview.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRound = () => {
    const reason = window.prompt(`Please provide a reason for putting "${round.roundName}" on hold / cancelling:`);
    if (reason === null) return;

    try {
      StorageService.cancelInterviewRound(application.id, round.id, reason.trim() || 'Schedule slot cancelled by recruiter');
      showToast(`Interview round cancelled/put on hold. Candidate notified.`, 'info');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel interview.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reschedule: ${round.roundName}`}
      subtitle={`Candidate: ${application.studentName} · ${application.company} (${application.jobTitle})`}
      maxWidth="md"
    >
      <form onSubmit={handleReschedule} className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Current Schedule Slot</span>
          </div>
          <p className="font-mono text-[11px] text-amber-800">
            {new Date(round.dateTime).toLocaleString([], {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            New Date & Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Interview Mode <span className="text-rose-500">*</span>
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="Online (Google Meet)">Online (Google Meet)</option>
            <option value="On-Campus (Placement Block)">On-Campus (Placement Block)</option>
            <option value="Hackerrank Platform">Hackerrank Platform</option>
            <option value="Virtual Interview">Virtual Interview</option>
            <option value="In-Person / Office">In-Person / Office</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Meeting Link or Campus Venue
          </label>
          <input
            type="text"
            value={meetingLinkOrVenue}
            onChange={(e) => setMeetingLinkOrVenue(e.target.value)}
            placeholder="e.g. https://meet.google.com/xyz or Tech Lab 3"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Reason / Reschedule Note for Candidate (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Interview panel had an emergency conflict, slot shifted by 2 hours."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCancelRound}
            className="px-3 py-1.5 font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel / Hold Slot
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
