import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StorageService } from '../../services/storageService';
import { AcademicService } from '../../services/academicService';
import { PlacementService } from '../../services/placementService';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { SubmitAssignmentModal } from '../academic/SubmitAssignmentModal';
import { Assignment } from '../../types';
import { 
  GraduationCap, 
  UserCheck, 
  ClipboardList, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = useState(0);
  React.useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const [activeSubmitAsg, setActiveSubmitAsg] = useState<Assignment | null>(null);

  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();
  const attendanceRecords = StorageService.getAttendance();
  const jobPosts = StorageService.getJobPosts();
  const allApplications = StorageService.getApplications();
  const applications = allApplications.filter(a => 
    a.studentId === currentUser.id ||
    (currentUser.rollNo && a.studentRollNo === currentUser.rollNo) ||
    (currentUser.email && (a as any).studentEmail === currentUser.email)
  );
  const calendarEvents = StorageService.getCalendarEvents();

  // Metrics
  const attendanceMetrics = AcademicService.calculateStudentAttendance(attendanceRecords, currentUser.id, currentUser.rollNo);
  
  // Pending assignments: assignments without submission by this student
  const studentSubmissions = submissions.filter(
    s => s.studentId === currentUser.id || (currentUser.rollNo && s.studentRollNo === currentUser.rollNo)
  );
  const pendingAssignments = assignments.filter(
    a => !studentSubmissions.some(s => s.assignmentId === a.id)
  );

  // Recommended opportunities based on eligibility & skill match
  const recommendedJobs = jobPosts.map(job => {
    const match = PlacementService.evaluateCandidate(currentUser, job);
    return { job, match };
  }).filter(item => item.match.isEligible);

  return (
    <div className="space-y-6">
      {/* 1. Personalized Greeting & Progress Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-blue-200 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Final-Year Engineering Portal · Class of 2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 leading-relaxed">
            {currentUser.department} · Roll No: {(currentUser as any).rollNo || '21CS104'}
          </p>

          {/* Core Answering Strip: How am I progressing? What needs attention? What next? */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider block">
                1. Academic Standing
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {attendanceMetrics.overallPercentage >= 75 ? 'Good Standing' : 'Attendance Warning'}
              </p>
              <p className="text-[11px] text-blue-200 mt-0.5">
                CGPA {currentUser.cgpa?.toFixed(2)} · {attendanceMetrics.overallPercentage}% Attendance
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider block">
                2. Needs Attention
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {pendingAssignments.length > 0 
                  ? `${pendingAssignments.length} Pending Assignment${pendingAssignments.length > 1 ? 's' : ''}` 
                  : 'All Assignments Clear'}
              </p>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {pendingAssignments[0] ? `Due: ${pendingAssignments[0].dueDate}` : 'Up to date with submissions'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider block">
                3. Recommended Next
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {applications.length > 0 ? 'Prep Round 2 Interview' : 'Explore Placement Drives'}
              </p>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {recommendedJobs.length} eligible company openings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Next-Step Prompt If Resume Not Uploaded */}
      {!currentUser.resume && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <span>Action Required: Upload Your Resume for Skill Analysis & Placement Eligibility</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  Pending Next Step
                </span>
              </h3>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                Your academic profile is ready! To participate in campus recruitment drives, verify job eligibility, and generate your corporate AI skill gap roadmap, please upload your PDF or DOCX resume.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/resume-skills')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shrink-0 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Upload Resume & Extract Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cumulative CGPA"
          value={currentUser.cgpa?.toFixed(2) || '8.92'}
          subtext="Scale of 10.00"
          icon={GraduationCap}
          accentColor="blue"
          onClick={() => navigate('/academics')}
        />
        <StatCard
          label="Overall Attendance"
          value={`${attendanceMetrics.overallPercentage}%`}
          subtext={attendanceMetrics.overallPercentage >= 75 ? 'Meets 75% threshold' : 'Attendance shortage!'}
          icon={UserCheck}
          accentColor={attendanceMetrics.overallPercentage >= 75 ? 'emerald' : 'amber'}
          onClick={() => navigate('/academics')}
        />
        <StatCard
          label="Pending Assignments"
          value={pendingAssignments.length}
          subtext={pendingAssignments.length === 0 ? 'All submitted' : 'Awaiting your submission'}
          icon={ClipboardList}
          accentColor="slate"
          onClick={() => navigate('/academics')}
        />
        <StatCard
          label="Active Applications"
          value={applications.length}
          subtext={`${applications.filter(a => a.status === 'Interviewing').length} in interview phase`}
          icon={Briefcase}
          accentColor="purple"
          onClick={() => navigate('/applications')}
        />
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
          Quick Actions:
        </span>
        <button
          onClick={() => navigate('/academics')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
          <span>View Assignments</span>
        </button>
        <button
          onClick={() => navigate('/academics')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Check Attendance</span>
        </button>
        <button
          onClick={() => navigate('/opportunities')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
          <span>Explore Opportunities</span>
        </button>
        <button
          onClick={() => navigate('/ai-assistant')}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* 4. Two-Column Layout: Pending Action Items + Recommended Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Impending Deadlines & Assignments */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pending Assignments & Deadlines
              </h3>
            </div>
            <button
              onClick={() => navigate('/academics')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
            >
              All Courses <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingAssignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                🎉 No pending assignments! You have submitted all lab requirements.
              </div>
            ) : (
              pendingAssignments.map(asg => (
                <div
                  key={asg.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">{asg.title}</h4>
                      <p className="text-[11px] text-slate-500">{asg.subject} · By {asg.facultyName}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {asg.maxMarks} Marks
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-[11px] text-rose-600 font-medium font-mono">
                      Due Date: {asg.dueDate}
                    </span>
                    <button
                      onClick={() => setActiveSubmitAsg(asg)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recommended Opportunities Based on Eligibility & Skills */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recommended Opportunities (Eligible)
              </h3>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-0.5"
            >
              Browse All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active matching job openings right now. Check back soon.
              </div>
            ) : (
              recommendedJobs.slice(0, 3).map(({ job, match }) => {
                const alreadyApplied = applications.some(a => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-200 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">{job.title}</h4>
                        <p className="text-[11px] text-slate-500">{job.company} · {job.location}</p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {job.salaryPackage}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {match.skillMatchPercentage}% Match
                      </span>
                      {match.matchedSkills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400">
                        Deadline: {job.applicationDeadline}
                      </span>
                      {alreadyApplied ? (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => navigate('/opportunities')}
                          className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          View & Apply →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Upcoming Exams, Interviews & Campus Drives */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Upcoming Schedule & Interview Rounds
            </h3>
          </div>
          <button
            onClick={() => navigate('/calendar')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Full Academic Calendar →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {calendarEvents.slice(0, 3).map(event => (
            <div key={event.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  {event.date} {event.time ? `· ${event.time}` : ''}
                </span>
                <StatusBadge status={event.category} size="sm" />
              </div>
              <h5 className="text-xs font-semibold text-slate-900 leading-snug">{event.title}</h5>
              <p className="text-[11px] text-slate-500 truncate">{event.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Submission from Dashboard */}
      {activeSubmitAsg && (
        <SubmitAssignmentModal
          isOpen={!!activeSubmitAsg}
          onClose={() => setActiveSubmitAsg(null)}
          assignment={activeSubmitAsg}
          onSubmitted={() => {
            setActiveSubmitAsg(null);
          }}
        />
      )}
    </div>
  );
};
