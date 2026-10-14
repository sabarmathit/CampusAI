import { User, Application, JobPost, AttendanceRecord, Assignment, Submission } from '../types';

export interface AIChatResponse {
  success: boolean;
  answer: string;
  agentId: string;
  retrievedEntities: string[];
  ragUsed: boolean;
}

export const ApiService = {
  /**
   * Real AI Chat request to server-side Multi-Agent Gemini Orchestrator.
   */
  async chatAI(params: {
    query: string;
    user: User;
    history?: Array<{ sender: 'user' | 'agent'; text: string }>;
  }): Promise<AIChatResponse> {
    const formattedHistory = (params.history || []).map(h => ({
      role: (h.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: h.text
    }));

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.user.id,
        role: params.user.role,
        query: params.query,
        history: formattedHistory
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `Server responded with ${response.status}`);
    }

    return response.json();
  },

  // --- Real Dashboards ---
  async getStudentDashboard(userId: string) {
    const res = await fetch(`/api/dashboard/student?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load student dashboard');
    return res.json();
  },

  async getFacultyDashboard(userId: string) {
    const res = await fetch(`/api/dashboard/faculty?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load faculty dashboard');
    return res.json();
  },

  async getRecruiterDashboard(userId: string) {
    const res = await fetch(`/api/dashboard/recruiter?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load recruiter dashboard');
    return res.json();
  },

  async getPlacementDashboard() {
    const res = await fetch('/api/dashboard/placement');
    if (!res.ok) throw new Error('Failed to load placement dashboard');
    return res.json();
  },

  // --- Academic & Attendance ---
  async syncAttendanceBatch(records: any[]) {
    const res = await fetch('/api/academic/attendance/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    if (!res.ok) throw new Error('Failed to sync attendance batch to backend');
    return res.json();
  },

  async syncSubmission(submission: any) {
    const res = await fetch('/api/academic/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    if (!res.ok) throw new Error('Failed to sync submission to backend');
    return res.json();
  },

  async syncGradeSubmission(id: string, marksObtained: number, feedback?: string) {
    const res = await fetch(`/api/academic/submissions/${id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marksObtained, feedback })
    });
    if (!res.ok) throw new Error('Failed to grade submission on backend');
    return res.json();
  },

  // --- Placement & ATS ---
  async syncJobPost(job: any) {
    const res = await fetch('/api/placement/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    if (!res.ok) throw new Error('Failed to post job to backend');
    return res.json();
  },

  async syncApply(jobId: string, studentId: string, coverLetter?: string) {
    const res = await fetch('/api/placement/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, studentId, coverLetter })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Application failed' }));
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },

  async syncApplicationStatus(id: string, status: string) {
    const res = await fetch(`/api/placement/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update application status');
    return res.json();
  },

  async syncRejectApplication(id: string, category: string, feedback: string, recruiterId?: string) {
    const res = await fetch(`/api/placement/applications/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, feedback, recruiterId })
    });
    if (!res.ok) throw new Error('Failed to record rejection on backend');
    return res.json();
  },

  async syncScheduleInterview(id: string, roundData: any) {
    const res = await fetch(`/api/placement/applications/${id}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roundData)
    });
    if (!res.ok) throw new Error('Failed to schedule interview round');
    return res.json();
  },

  async syncRescheduleInterview(id: string, roundId: string, update: any) {
    const res = await fetch(`/api/placement/applications/${id}/interviews/${roundId}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to reschedule interview round');
    return res.json();
  },

  async syncCancelInterview(id: string, roundId: string, reason?: string) {
    const res = await fetch(`/api/placement/applications/${id}/interviews/${roundId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to cancel interview round');
    return res.json();
  },

  async syncRejectInterview(id: string, roundId: string, category: string, feedback: string, recruiterId?: string) {
    const res = await fetch(`/api/placement/applications/${id}/interviews/${roundId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, feedback, recruiterId })
    });
    if (!res.ok) throw new Error('Failed to record round rejection');
    return res.json();
  },

  // --- Real Resume Analysis with Gemini ---
  async analyzeResume(studentId: string, resumeText: string, fileName?: string) {
    const res = await fetch('/api/placement/resume/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, resumeText, fileName })
    });
    if (!res.ok) throw new Error('Failed to analyze resume on backend');
    return res.json();
  },

  // --- Real Skill Gap Analysis ---
  async checkSkillGap(studentId: string, targetRole: string, requiredSkills: string[]) {
    const res = await fetch('/api/placement/resume/skill-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, targetRole, requiredSkills })
    });
    if (!res.ok) throw new Error('Failed to check skill gap');
    return res.json();
  },

  // --- Real Eligibility Calculation ---
  async checkEligibility(studentId: string, jobId: string) {
    const res = await fetch('/api/placement/eligibility/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, jobId })
    });
    if (!res.ok) throw new Error('Failed to verify eligibility');
    return res.json();
  },

  /**
   * Realtime Server-Sent Events (SSE) Stream Subscription.
   * Subscribes to live backend database modifications and broadcasts
   * to frontend stores and windows.
   */
  connectRealtime(onEvent: (entity: string, data: any) => void): () => void {
    if (typeof EventSource === 'undefined') {
      return () => {};
    }

    try {
      const source = new EventSource('/api/realtime/stream');

      source.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent(parsed.entity, parsed.data);
        } catch (err) {
          // ignore heartbeat
        }
      };

      const eventTypes = ['attendance', 'assignments', 'submissions', 'jobPosts', 'applications', 'notifications', 'users'];
      eventTypes.forEach(type => {
        source.addEventListener(type, (e: any) => {
          try {
            const parsed = JSON.parse(e.data);
            onEvent(type, parsed.data);
            // Also notify existing window listeners
            window.dispatchEvent(new CustomEvent('campus_storage_update', { detail: { entity: type } }));
          } catch (err) {
            console.error('Error handling SSE event:', err);
          }
        });
      });

      source.onerror = () => {
        // SSE handles reconnection automatically
      };

      return () => {
        source.close();
      };
    } catch (err) {
      console.error('Error setting up SSE connection:', err);
      return () => {};
    }
  }
};
