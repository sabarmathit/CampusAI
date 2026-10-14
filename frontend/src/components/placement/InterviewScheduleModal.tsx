import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Application, InterviewRound, InterviewRoundStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onScheduled: () => void;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  application,
  onScheduled
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const nextRoundNum = (application?.interviewRounds.length || 0) + 1;
  const defaultNames = [
    'Round 1: Online Technical Assessment',
    'Round 2: Technical Interview (System Design & Coding)',
    'Round 3: Technical Architecture & Problem Solving',
    'Round 4: Culture Fit & HR Discussion'
  ];

  const [roundName, setRoundName] = useState(
    defaultNames[nextRoundNum - 1] || `Round ${nextRoundNum}: Technical Screener`
  );
  const [dateTime, setDateTime] = useState('2026-10-16T14:30');
  const [mode, setMode] = useState<InterviewRound['mode']>('Online (Google Meet)');
  const [venueOrLink, setVenueOrLink] = useState('https://meet.google.com/nxt-interview-room');

  if (!application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!roundName.trim() || !dateTime) {
      showToast('Please provide round name and scheduled date/time', 'error');
      return;
    }

    StorageService.scheduleInterviewRound(application.id, {
      roundNumber: nextRoundNum,
      roundName: roundName.trim(),
      dateTime,
      mode,
      status: 'Scheduled',
      meetingLinkOrVenue: venueOrLink.trim(),
      scheduledBy: currentUser.id
    });

    showToast(`Scheduled ${roundName} for ${application.studentName}! Candidate notified.`, 'success');
    onScheduled();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview Round ${nextRoundNum}`}
      subtitle={`Candidate: ${application.studentName} · ${application.company} (${application.jobTitle})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Interview Round Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview Mode <span className="text-rose-500">*</span>
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
            >
              <option value="Online (Google Meet)">Online (Google Meet)</option>
              <option value="On-Campus (Placement Block)">On-Campus (Placement Block)</option>
              <option value="Hackerrank Platform">Hackerrank Platform</option>
              <option value="Virtual Interview">Virtual Interview</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Meeting Link or Campus Venue
          </label>
          <input
            type="text"
            value={venueOrLink}
            onChange={(e) => setVenueOrLink(e.target.value)}
            placeholder="e.g. https://meet.google.com/xyz or Seminar Hall 2"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
          <p className="font-semibold mb-0.5">Explicit Scheduling Notice:</p>
          <p className="text-[11px] leading-relaxed">
            Per campus recruitment rules, each round must be scheduled deliberately. The student will receive an instant notification and automated calendar invite.
          </p>
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
            className="px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
          >
            Confirm & Schedule Round
          </button>
        </div>
      </form>
    </Modal>
  );
};
