import {
  User,
  Subject,
  Assignment,
  Submission,
  AttendanceRecord,
  InternalMarkRecord,
  SemesterMarkRecord,
  JobPost,
  Application,
  PlacementDrive,
  Project,
  AppNotification,
  CalendarEvent,
  InterviewRound,
  ApplicationStatus,
  ResumeData,
  RejectionCategory,
  RejectionFeedback
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_INTERNAL_MARKS,
  INITIAL_SEMESTER_MARKS,
  INITIAL_JOB_POSTS,
  INITIAL_APPLICATIONS,
  INITIAL_PLACEMENT_DRIVES,
  INITIAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CALENDAR_EVENTS
} from '../data/mockData';
import { ApiService } from './apiService';

const STORAGE_KEYS = {
  USERS: 'campus_users_v2',
  CURRENT_USER_ID: 'campus_current_user_id_v2',
  SUBJECTS: 'campus_subjects_v2',
  ASSIGNMENTS: 'campus_assignments_v2',
  SUBMISSIONS: 'campus_submissions_v2',
  ATTENDANCE: 'campus_attendance_v2',
  INTERNAL_MARKS: 'campus_internal_marks_v2',
  SEMESTER_MARKS: 'campus_semester_marks_v2',
  JOB_POSTS: 'campus_job_posts_v2',
  APPLICATIONS: 'campus_applications_v2',
  PLACEMENT_DRIVES: 'campus_placement_drives_v2',
  PROJECTS: 'campus_projects_v2',
  NOTIFICATIONS: 'campus_notifications_v2',
  CALENDAR: 'campus_calendar_v2',
};

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T, entityName: string): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('campus_storage_update', { detail: { entity: entityName } }));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  // Initialization - ensures seed records exist
  initStorage() {
    getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    getFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    getFromStorage(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    getFromStorage(STORAGE_KEYS.INTERNAL_MARKS, INITIAL_INTERNAL_MARKS);
    getFromStorage(STORAGE_KEYS.SEMESTER_MARKS, INITIAL_SEMESTER_MARKS);
    getFromStorage(STORAGE_KEYS.JOB_POSTS, INITIAL_JOB_POSTS);
    getFromStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    getFromStorage(STORAGE_KEYS.PLACEMENT_DRIVES, INITIAL_PLACEMENT_DRIVES);
    getFromStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    getFromStorage(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS);

    // Connect to live backend SSE stream
    if (typeof window !== 'undefined' && !(window as any).__campus_realtime_connected) {
      (window as any).__campus_realtime_connected = true;
      ApiService.connectRealtime((entity, data) => {
        // Broadcast to views
        window.dispatchEvent(new CustomEvent('campus_storage_update', { detail: { entity, data } }));
      });
    }
  },

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.INTERNAL_MARKS, JSON.stringify(INITIAL_INTERNAL_MARKS));
    localStorage.setItem(STORAGE_KEYS.SEMESTER_MARKS, JSON.stringify(INITIAL_SEMESTER_MARKS));
    localStorage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify(INITIAL_JOB_POSTS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.PLACEMENT_DRIVES, JSON.stringify(INITIAL_PLACEMENT_DRIVES));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR_EVENTS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.dispatchEvent(new CustomEvent('campus_storage_update', { detail: { entity: 'all' } }));
  },

  // Users & Authentication
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  getCurrentUser(): User | null {
    const id = this.getCurrentUserId();
    if (!id) return null;
    const user = this.getUserById(id);
    return user || null;
  },

  setCurrentUser(userId: string | null) {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    window.dispatchEvent(new CustomEvent('campus_storage_update', { detail: { entity: 'currentUser' } }));
  },

  loginUser(email: string, password?: string): User {
    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('No registered account found with this email address.');
    }

    if (password && user.password && user.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    this.setCurrentUser(user.id);
    return user;
  },

  registerUser(userData: Omit<User, 'id'>, password?: string): User {
    const users = this.getUsers();
    const normalizedEmail = userData.email.trim().toLowerCase();
    
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      password: password || 'password123'
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users, 'users');
    this.setCurrentUser(newUser.id);
    return newUser;
  },

  logoutUser() {
    this.setCurrentUser(null);
  },

  updateUser(updated: User) {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    saveToStorage(STORAGE_KEYS.USERS, users, 'users');
  },

  // Resume Management
  saveStudentResume(studentId: string, resumeData: ResumeData): User {
    const users = this.getUsers();
    const user = users.find(u => u.id === studentId);
    if (!user) throw new Error('Student record not found.');

    user.resume = resumeData;
    // Also merge extracted skills into student's possessed skills
    const currentSkills = user.skills || [];
    const merged = Array.from(new Set([...currentSkills, ...resumeData.extractedSkills]));
    user.skills = merged;

    saveToStorage(STORAGE_KEYS.USERS, users, 'users');
    return user;
  },

  removeStudentResume(studentId: string): User {
    const users = this.getUsers();
    const user = users.find(u => u.id === studentId);
    if (!user) throw new Error('Student record not found.');

    user.resume = undefined;
    saveToStorage(STORAGE_KEYS.USERS, users, 'users');
    return user;
  },

  // Subjects
  getSubjects(): Subject[] {
    return getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  // Assignments
  getAssignments(): Assignment[] {
    return getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const assignments = this.getAssignments();
    const newAsg: Assignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    assignments.unshift(newAsg);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments, 'assignments');

    // Notify all students
    const students = this.getUsers().filter(u => u.role === 'student');
    students.forEach(student => {
      this.createNotification({
        targetUserId: student.id,
        title: 'New Assignment Published',
        message: `${newAsg.facultyName} posted "${newAsg.title}" for ${newAsg.subject}. Due: ${newAsg.dueDate} ${newAsg.dueTime || ''}.`,
        type: 'assignment',
        relatedRecordId: newAsg.id,
        link: '/assignments'
      });
    });

    // Add to Calendar
    this.createCalendarEvent({
      title: `${newAsg.title} Deadline`,
      category: 'assignment',
      date: newAsg.dueDate,
      time: newAsg.dueTime || '23:59',
      description: `Submission deadline for ${newAsg.subject}`,
      targetRole: 'student'
    });

    return newAsg;
  },

  // Submissions with strict deadline validation
  getSubmissions(): Submission[] {
    return getFromStorage<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    studentName: string;
    studentRollNo: string;
    fileName: string;
    notes?: string;
  }): Submission {
    const assignment = this.getAssignments().find(a => a.id === data.assignmentId);
    if (!assignment) throw new Error('Assignment not found.');

    // Strict Deadline Validation
    const now = new Date();
    const dueDateTimeString = assignment.dueTime 
      ? `${assignment.dueDate}T${assignment.dueTime}:00` 
      : `${assignment.dueDate}T23:59:59`;
    const deadline = new Date(dueDateTimeString);

    const isOverdue = now.getTime() > deadline.getTime();
    if (isOverdue && !assignment.allowLateSubmission) {
      throw new Error(`Submission deadline passed on ${deadline.toLocaleString()}. Late submissions are disabled by faculty.`);
    }

    const submissionStatus: Submission['status'] = isOverdue ? 'late' : 'submitted';

    const submissions = this.getSubmissions();
    const existingIndex = submissions.findIndex(
      s => s.assignmentId === data.assignmentId && s.studentId === data.studentId
    );

    const newSub: Submission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      studentName: data.studentName,
      studentRollNo: data.studentRollNo,
      submittedAt: now.toISOString(),
      fileName: data.fileName,
      notes: data.notes,
      status: submissionStatus
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = newSub;
    } else {
      submissions.unshift(newSub);
    }
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions, 'submissions');

    // Notify faculty who owns this assignment
    this.createNotification({
      targetUserId: assignment.facultyId,
      title: isOverdue ? 'Late Assignment Submitted' : 'Assignment Submitted',
      message: `${data.studentName} submitted "${assignment.title}" (${isOverdue ? 'Late Submission' : 'On Time'}).`,
      type: 'assignment',
      relatedRecordId: newSub.id,
      link: '/assignments'
    });

    return newSub;
  },

  gradeSubmission(submissionId: string, marks: number, feedback: string): void {
    const submissions = this.getSubmissions();
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    sub.marksObtained = marks;
    sub.feedback = feedback;
    sub.status = 'graded';
    sub.gradedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions, 'submissions');

    // Notify student
    const assignment = this.getAssignments().find(a => a.id === sub.assignmentId);
    const asgTitle = assignment ? assignment.title : 'Assignment';
    this.createNotification({
      targetUserId: sub.studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${asgTitle}" was graded: ${marks}/${assignment?.maxMarks || 50} marks. Feedback: "${feedback}".`,
      type: 'marks',
      relatedRecordId: sub.id,
      link: '/academic-marks'
    });
  },

  // Attendance - strictly separate subject records
  getAttendance(): AttendanceRecord[] {
    return getFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  saveAttendanceBatch(records: {
    studentId: string;
    studentName: string;
    studentRollNo: string;
    department: string;
    subjectId: string;
    subject: string;
    date: string;
    status: 'present' | 'absent';
    facultyId: string;
    facultyName: string;
    remarks?: string;
  }[]): void {
    const existing = this.getAttendance();
    const updated = [...existing];

    records.forEach(rec => {
      const idx = updated.findIndex(
        r => r.studentId === rec.studentId && r.subjectId === rec.subjectId && r.date === rec.date
      );

      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...rec };
      } else {
        updated.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ...rec
        });
      }

      // If student marked absent, trigger alert notification
      if (rec.status === 'absent') {
        this.createNotification({
          targetUserId: rec.studentId,
          title: 'Attendance Alert: Marked Absent',
          message: `You were marked ABSENT for ${rec.subject} on ${rec.date} by ${rec.facultyName}. ${rec.remarks ? `Note: ${rec.remarks}` : ''}`,
          type: 'attendance',
          relatedRecordId: rec.subjectId,
          link: '/attendance'
        });
      }
    });

    saveToStorage(STORAGE_KEYS.ATTENDANCE, updated, 'attendance');
    ApiService.syncAttendanceBatch(records).catch(err => console.warn('Attendance backend sync error:', err));
  },

  // Academic Marks Management
  getInternalMarks(): InternalMarkRecord[] {
    return getFromStorage<InternalMarkRecord[]>(STORAGE_KEYS.INTERNAL_MARKS, INITIAL_INTERNAL_MARKS);
  },

  saveInternalMark(record: Omit<InternalMarkRecord, 'id'>): InternalMarkRecord {
    const marks = this.getInternalMarks();
    const existingIdx = marks.findIndex(
      m => m.studentId === record.studentId && m.subjectId === record.subjectId && m.testName === record.testName
    );

    let savedRecord: InternalMarkRecord;
    if (existingIdx >= 0) {
      savedRecord = { ...marks[existingIdx], ...record };
      marks[existingIdx] = savedRecord;
    } else {
      savedRecord = { ...record, id: `im-${Date.now()}` };
      marks.push(savedRecord);
    }

    saveToStorage(STORAGE_KEYS.INTERNAL_MARKS, marks, 'internalMarks');

    // Notify student
    this.createNotification({
      targetUserId: record.studentId,
      title: 'Internal Assessment Marks Published',
      message: `Your score for ${record.subjectName} (${record.testName}) is ${record.marksObtained}/${record.maxMarks}.`,
      type: 'marks',
      relatedRecordId: savedRecord.id,
      link: '/academic-marks'
    });

    return savedRecord;
  },

  getSemesterMarks(): SemesterMarkRecord[] {
    return getFromStorage<SemesterMarkRecord[]>(STORAGE_KEYS.SEMESTER_MARKS, INITIAL_SEMESTER_MARKS);
  },

  saveSemesterMark(record: Omit<SemesterMarkRecord, 'id'>): SemesterMarkRecord {
    const marks = this.getSemesterMarks();
    const existingIdx = marks.findIndex(
      m => m.studentId === record.studentId && m.subjectId === record.subjectId && m.semester === record.semester
    );

    let savedRecord: SemesterMarkRecord;
    if (existingIdx >= 0) {
      savedRecord = { ...marks[existingIdx], ...record };
      marks[existingIdx] = savedRecord;
    } else {
      savedRecord = { ...record, id: `sm-${Date.now()}` };
      marks.push(savedRecord);
    }

    saveToStorage(STORAGE_KEYS.SEMESTER_MARKS, marks, 'semesterMarks');

    // Notify student
    this.createNotification({
      targetUserId: record.studentId,
      title: 'Semester Grade Result Published',
      message: `${record.subjectName} (${record.semester}): Grade ${record.grade} (${record.marksObtained}/${record.maxMarks} - ${record.resultStatus}).`,
      type: 'marks',
      relatedRecordId: savedRecord.id,
      link: '/academic-marks'
    });

    return savedRecord;
  },

  // Jobs
  getJobPosts(): JobPost[] {
    return getFromStorage<JobPost[]>(STORAGE_KEYS.JOB_POSTS, INITIAL_JOB_POSTS);
  },

  createJobPost(post: Omit<JobPost, 'id' | 'createdAt'>): JobPost {
    const posts = this.getJobPosts();
    const newPost: JobPost = {
      ...post,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    posts.unshift(newPost);
    saveToStorage(STORAGE_KEYS.JOB_POSTS, posts, 'jobPosts');

    // Notify Placement Cell
    const tpoUsers = this.getUsers().filter(u => u.role === 'placement');
    tpoUsers.forEach(tpo => {
      this.createNotification({
        targetUserId: tpo.id,
        title: 'New Recruiter Job Opening',
        message: `${newPost.company} posted "${newPost.title}" (${newPost.salaryPackage}). Review matches now.`,
        type: 'job',
        relatedRecordId: newPost.id,
        link: '/opportunities'
      });
    });

    return newPost;
  },

  // Applications
  getApplications(): Application[] {
    return getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },

  applyForJob(data: {
    jobId: string;
    studentId: string;
    coverLetter?: string;
  }): Application {
    const job = this.getJobPosts().find(j => j.id === data.jobId);
    const student = this.getUserById(data.studentId);
    if (!job || !student) throw new Error('Job or student not found.');

    const applications = this.getApplications();
    const existing = applications.find(a => a.jobId === data.jobId && a.studentId === data.studentId);
    if (existing) {
      throw new Error('You have already submitted an application for this opportunity.');
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNo || '21CS104',
      studentDepartment: student.department || 'Computer Science & Engineering',
      studentCGPA: Number(student.cgpa || 0),
      studentSkills: student.skills || [],
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      interviewRounds: [],
      currentRoundName: 'Application Received',
      finalResult: 'Pending',
      coverLetter: data.coverLetter
    };

    applications.unshift(newApp);
    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncApply(data.jobId, data.studentId, data.coverLetter).catch(err => console.warn('Apply backend sync error:', err));

    // Notify recruiter
    this.createNotification({
      targetUserId: job.recruiterId,
      title: 'New Candidate Application',
      message: `${student.name} applied for "${job.title}". CGPA: ${student.cgpa}.`,
      type: 'job',
      relatedRecordId: newApp.id,
      link: '/applicants'
    });

    // Notify placement cell
    const tpos = this.getUsers().filter(u => u.role === 'placement');
    tpos.forEach(tpo => {
      this.createNotification({
        targetUserId: tpo.id,
        title: 'Student Application Filed',
        message: `${student.name} applied for ${job.company} - ${job.title}.`,
        type: 'job',
        relatedRecordId: newApp.id,
        link: '/applications'
      });
    });

    return newApp;
  },

  shortlistApplicant(applicationId: string): Application {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) {
      throw new Error('This candidate has not applied for the job and cannot be shortlisted.');
    }

    app.status = 'Shortlisted';
    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');

    // Notify candidate
    this.createNotification({
      targetUserId: app.studentId,
      title: 'Application Shortlisted!',
      message: `Congratulations! ${app.company} has shortlisted your profile for "${app.jobTitle}".`,
      type: 'job',
      relatedRecordId: app.id,
      link: '/applications'
    });

    return app;
  },

  scheduleInterviewRound(applicationId: string, roundData: Omit<InterviewRound, 'id' | 'updatedAt' | 'applicationId'>): InterviewRound {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) throw new Error('Application record not found.');

    const newRound: InterviewRound = {
      ...roundData,
      id: `rnd-${Date.now()}`,
      applicationId: app.id,
      updatedAt: new Date().toISOString()
    };

    app.interviewRounds.push(newRound);
    app.status = 'Interviewing';
    app.currentRoundName = roundData.roundName;

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncScheduleInterview(applicationId, roundData).catch(err => console.warn('Interview schedule sync error:', err));

    // Notify Student
    this.createNotification({
      targetUserId: app.studentId,
      title: `Interview Round Scheduled: ${roundData.roundName}`,
      message: `${app.company} scheduled "${roundData.roundName}" on ${new Date(roundData.dateTime).toLocaleString()}. Mode: ${roundData.mode}.`,
      type: 'interview',
      relatedRecordId: newRound.id,
      link: '/interview-progress'
    });

    // Add to Calendar
    this.createCalendarEvent({
      title: `${app.company} - ${roundData.roundName} (${app.studentName})`,
      category: 'interview',
      date: roundData.dateTime.split('T')[0],
      time: roundData.dateTime.split('T')[1]?.substring(0, 5) || '10:00',
      description: `${roundData.mode} | ${roundData.meetingLinkOrVenue || 'Venue details in portal'}`,
      targetRole: 'all'
    });

    return newRound;
  },

  updateInterviewRound(applicationId: string, roundId: string, updates: Partial<InterviewRound>): void {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const round = app.interviewRounds.find(r => r.id === roundId);
    if (!round) return;

    Object.assign(round, updates);
    round.updatedAt = new Date().toISOString();

    if (updates.status === 'Rejected') {
      app.status = 'Rejected';
      app.finalResult = 'Rejected';
    } else if (updates.status === 'Selected') {
      if (round.roundName.toLowerCase().includes('hr') || round.roundNumber >= 3) {
        app.status = 'Selected';
        app.finalResult = 'Selected';
      }
    }

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');

    // Notify student
    this.createNotification({
      targetUserId: app.studentId,
      title: `Interview Update: ${round.roundName}`,
      message: `${app.company} updated status for "${round.roundName}" to "${updates.status}". ${updates.feedback ? 'Feedback: ' + updates.feedback : ''}`,
      type: 'interview',
      relatedRecordId: round.id,
      link: '/interview-progress'
    });
  },

  updateApplicationStatus(applicationId: string, status: ApplicationStatus, notes?: string): void {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    app.status = status;
    if (status === 'Selected') app.finalResult = 'Selected';
    if (status === 'Rejected') app.finalResult = 'Rejected';

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncApplicationStatus(applicationId, status).catch(err => console.warn('Status backend sync error:', err));

    this.createNotification({
      targetUserId: app.studentId,
      title: `Application Status: ${status}`,
      message: `Your application status for ${app.company} (${app.jobTitle}) has been updated to "${status}".${notes ? ' Note: ' + notes : ''}`,
      type: 'job',
      relatedRecordId: app.id,
      link: '/applications'
    });
  },

  rejectApplication(
    applicationId: string,
    data: {
      recruiterId: string;
      recruiterName: string;
      category: RejectionCategory;
      feedback: string;
    }
  ): Application {
    if (!data.feedback || !data.feedback.trim()) {
      throw new Error('Mandatory detailed feedback must be provided before rejecting an application.');
    }

    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) throw new Error('Application record not found.');

    const feedbackRecord: RejectionFeedback = {
      id: `rf-${Date.now()}`,
      applicationId: app.id,
      recruiterId: data.recruiterId,
      recruiterName: data.recruiterName,
      companyName: app.company,
      category: data.category,
      feedback: data.feedback.trim(),
      rejectedAt: new Date().toISOString()
    };

    app.status = 'Rejected';
    app.finalResult = 'Rejected';
    app.rejectionFeedback = feedbackRecord;

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncRejectApplication(applicationId, data.category, data.feedback, data.recruiterId).catch(err => console.warn('Reject backend sync error:', err));

    // Notify Student with explicit required format
    this.createNotification({
      targetUserId: app.studentId,
      title: `Application Update: ${app.company} (${app.jobTitle})`,
      message: `Your application for ${app.jobTitle} at ${app.company} has been rejected. The recruiter has provided feedback. Click to view details.`,
      type: 'job',
      relatedRecordId: app.id,
      link: '/applications'
    });

    return app;
  },

  rejectInterviewRound(
    applicationId: string,
    roundId: string,
    data: {
      recruiterId: string;
      recruiterName: string;
      category: RejectionCategory;
      feedback: string;
    }
  ): InterviewRound {
    if (!data.feedback || !data.feedback.trim()) {
      throw new Error('Mandatory detailed feedback must be provided before rejecting an interview round.');
    }

    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) throw new Error('Application record not found.');

    const round = app.interviewRounds.find(r => r.id === roundId);
    if (!round) throw new Error('Interview round not found.');

    const feedbackRecord: RejectionFeedback = {
      id: `rf-rnd-${Date.now()}`,
      applicationId: app.id,
      interviewRoundId: round.id,
      roundName: round.roundName,
      recruiterId: data.recruiterId,
      recruiterName: data.recruiterName,
      companyName: app.company,
      category: data.category,
      feedback: data.feedback.trim(),
      rejectedAt: new Date().toISOString()
    };

    round.status = 'Rejected';
    round.feedback = data.feedback.trim();
    round.rejectionReason = `${data.category}: ${data.feedback.trim()}`;
    round.rejectionFeedback = feedbackRecord;
    round.updatedAt = new Date().toISOString();

    app.status = 'Rejected';
    app.finalResult = 'Rejected';
    app.rejectionFeedback = feedbackRecord;

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncRejectInterview(applicationId, round.id, data.category, data.feedback, data.recruiterId).catch(err => console.warn('Interview reject sync error:', err));

    // Notify Student with explicit required format
    this.createNotification({
      targetUserId: app.studentId,
      title: `Interview Update: ${round.roundName} (${app.company})`,
      message: `Your interview for ${app.jobTitle} at ${app.company} (${round.roundName}) has concluded. The recruiter has provided feedback. Click to view details.`,
      type: 'interview',
      relatedRecordId: round.id,
      link: '/interviews'
    });

    return round;
  },

  rescheduleInterviewRound(
    applicationId: string,
    roundId: string,
    data: {
      newDateTime: string;
      mode?: InterviewRound['mode'];
      meetingLinkOrVenue?: string;
      notes?: string;
    }
  ): InterviewRound {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) throw new Error('Application record not found.');

    const round = app.interviewRounds.find(r => r.id === roundId);
    if (!round) throw new Error('Interview round not found.');

    round.dateTime = data.newDateTime;
    round.status = 'Rescheduled';
    if (data.mode) round.mode = data.mode;
    if (data.meetingLinkOrVenue) round.meetingLinkOrVenue = data.meetingLinkOrVenue;
    if (data.notes) round.feedback = (round.feedback ? round.feedback + ' | ' : '') + `Rescheduled note: ${data.notes}`;
    round.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncRescheduleInterview(applicationId, round.id, {
      dateTime: data.newDateTime,
      mode: data.mode || round.mode,
      meetingLinkOrVenue: data.meetingLinkOrVenue || round.meetingLinkOrVenue
    }).catch(err => console.warn('Reschedule backend sync error:', err));

    this.createNotification({
      targetUserId: app.studentId,
      title: `Interview Rescheduled: ${round.roundName}`,
      message: `Your interview for ${app.jobTitle} at ${app.company} (${round.roundName}) has been rescheduled to ${new Date(data.newDateTime).toLocaleString()}.`,
      type: 'interview',
      relatedRecordId: round.id,
      link: '/interviews'
    });

    return round;
  },

  cancelInterviewRound(applicationId: string, roundId: string, reason?: string): InterviewRound {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) throw new Error('Application record not found.');

    const round = app.interviewRounds.find(r => r.id === roundId);
    if (!round) throw new Error('Interview round not found.');

    round.status = 'On Hold';
    round.feedback = `Cancelled / Put on Hold: ${reason || 'Cancelled by recruiter'}`;
    round.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications, 'applications');
    ApiService.syncCancelInterview(applicationId, round.id, reason).catch(err => console.warn('Cancel backend sync error:', err));

    this.createNotification({
      targetUserId: app.studentId,
      title: `Interview Cancelled / On Hold: ${round.roundName}`,
      message: `Your interview for ${app.jobTitle} at ${app.company} (${round.roundName}) has been placed on hold. Reason: ${reason || 'Scheduled slot cancelled by recruiter'}.`,
      type: 'interview',
      relatedRecordId: round.id,
      link: '/interviews'
    });

    return round;
  },

  withdrawApplication(applicationId: string): void {
    const applications = this.getApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const filtered = applications.filter(a => a.id !== applicationId);
    saveToStorage(STORAGE_KEYS.APPLICATIONS, filtered, 'applications');

    this.createNotification({
      targetUserId: app.studentId,
      title: 'Application Withdrawn',
      message: `You successfully withdrew your application for ${app.company} (${app.jobTitle}).`,
      type: 'job',
      link: '/opportunities'
    });
  },

  // Placement Drives
  getPlacementDrives(): PlacementDrive[] {
    return getFromStorage<PlacementDrive[]>(STORAGE_KEYS.PLACEMENT_DRIVES, INITIAL_PLACEMENT_DRIVES);
  },

  createPlacementDrive(drive: Omit<PlacementDrive, 'id'>): PlacementDrive {
    const drives = this.getPlacementDrives();
    const newDrive: PlacementDrive = {
      ...drive,
      id: `drv-${Date.now()}`
    };
    drives.unshift(newDrive);
    saveToStorage(STORAGE_KEYS.PLACEMENT_DRIVES, drives, 'placementDrives');
    return newDrive;
  },

  // Projects
  getProjects(): Project[] {
    return getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  updateProject(updated: Project) {
    const projects = this.getProjects().map(p => p.id === updated.id ? updated : p);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects, 'projects');
  },

  createProject(projectData: Omit<Project, 'id'>): Project {
    const projects = this.getProjects();
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`
    };
    projects.unshift(newProj);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects, 'projects');
    return newProj;
  },

  // Notifications
  getNotifications(): AppNotification[] {
    return getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  createNotification(notifData: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const notifications = this.getNotifications();
    // Prevent duplicate notification if identical notification sent in last 60 seconds or unread duplicate exists
    const duplicate = notifications.find(
      n => n.targetUserId === notifData.targetUserId &&
           n.title === notifData.title &&
           n.message === notifData.message &&
           (!n.read || (Date.now() - new Date(n.createdAt).getTime()) < 60000)
    );
    if (duplicate) {
      return duplicate;
    }

    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications, 'notifications');
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications, 'notifications');
    }
  },

  markAllNotificationsAsRead(userId: string): void {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (n.targetUserId === userId) n.read = true;
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications, 'notifications');
  },

  // Calendar
  getCalendarEvents(): CalendarEvent[] {
    return getFromStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS);
  },

  createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getCalendarEvents();
    const newEv: CalendarEvent = {
      ...eventData,
      id: `ev-${Date.now()}`
    };
    events.push(newEv);
    saveToStorage(STORAGE_KEYS.CALENDAR, events, 'calendar');
    return newEv;
  }
};
