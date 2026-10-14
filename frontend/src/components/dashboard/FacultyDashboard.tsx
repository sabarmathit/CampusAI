import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { AcademicService } from '../../services/academicService';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { CreateAssignmentModal } from '../academic/CreateAssignmentModal';
import { GradeAssignmentModal } from '../academic/GradeAssignmentModal';
import { Assignment, Submission } from '../../types';
import {
  Users,
  ClipboardList,
  AlertTriangle,
  FolderGit2,
  Plus,
  UserCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<{
    assignment: Assignment;
    submission: Submission;
  } | null>(null);

  const assignments = StorageService.getAssignments().filter(a => a.facultyId === currentUser.id);
  const allSubmissions = StorageService.getSubmissions();
  const attendanceRecords = StorageService.getAttendance();
  const projects = StorageService.getProjects();
  const studentUsers = allUsers.filter(u => u.role === 'student');

  // Submissions for this faculty's assignments
  const myAssignmentIds = new Set(assignments.map(a => a.id));
  const mySubmissions = allSubmissions.filter(s => myAssignmentIds.has(s.assignmentId));
  const pendingGrading = mySubmissions.filter(s => s.status === 'submitted');

  // Students with low attendance (<75%) in any of this faculty's subjects
  const studentsWithLowAttendance = studentUsers.filter(student => {
    const metrics = AcademicService.calculateStudentAttendance(attendanceRecords, student.id);
    return metrics.overallPercentage < 75;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Course Director & Faculty Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-200">
              {currentUser.department} · {currentUser.designation || 'Professor'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-white/15 hover:bg-white/20 rounded-lg transition-colors border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Students"
          value={studentUsers.length}
          subtext="Enrolled across sections"
          icon={Users}
          accentColor="emerald"
          onClick={() => navigate('/faculty/students')}
        />
        <StatCard
          label="Pending Grading"
          value={pendingGrading.length}
          subtext="Submissions waiting review"
          icon={ClipboardList}
          accentColor="amber"
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          label="Low Attendance Alert"
          value={studentsWithLowAttendance.length}
          subtext="Students < 75% threshold"
          icon={AlertTriangle}
          accentColor="slate"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          label="Active Projects"
          value={projects.length}
          subtext="Supervised capstone teams"
          icon={FolderGit2}
          accentColor="blue"
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* 3. Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
          Faculty Actions:
        </span>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>New Assignment</span>
        </button>
        <button
          onClick={() => navigate('/attendance')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Take Lecture Attendance</span>
        </button>
        <button
          onClick={() => navigate('/assignments')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
          <span>Review Submissions ({pendingGrading.length})</span>
        </button>
      </div>

      {/* 4. Two-Column Layout: Recent Student Submissions & Low Attendance Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Student Submissions to Grade */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Submissions Requiring Review
              </h3>
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {mySubmissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No student submissions received yet.
              </div>
            ) : (
              mySubmissions.slice(0, 4).map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId) || {
                  title: 'Course Assignment',
                  maxMarks: 50
                };
                const isGraded = sub.status === 'graded';

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-200 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                          {sub.studentName} <span className="font-mono text-slate-500 font-normal">({sub.studentRollNo})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">{asg.title}</p>
                      </div>
                      <StatusBadge status={sub.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      {isGraded ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          Graded: {sub.marksObtained}/{asg.maxMarks}
                        </span>
                      ) : (
                        <button
                          onClick={() => setGradingSubmission({ assignment: asg as any, submission: sub })}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Attendance Risk Watchlist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Students with Low Attendance Risk (&lt; 75%)
              </h3>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-0.5"
            >
              Full Roster <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {studentsWithLowAttendance.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                🎉 All students maintain above 75% attendance in your courses!
              </div>
            ) : (
              studentsWithLowAttendance.map(student => {
                const metrics = AcademicService.calculateStudentAttendance(attendanceRecords, student.id);

                return (
                  <div
                    key={student.id}
                    className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-slate-900">
                        {student.name} <span className="font-mono text-slate-500 font-normal">({(student as any).rollNo || '21CS118'})</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                        {metrics.overallPercentage}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Attended {metrics.totalPresent} of {metrics.totalClasses} classes · {student.department}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-rose-700">
                      <span>Automated absence warnings delivered</span>
                      <button
                        onClick={() => navigate('/attendance')}
                        className="font-semibold hover:underline"
                      >
                        Update Log →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating Assignment */}
      <CreateAssignmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          // Trigger refresh
        }}
      />

      {/* Modal for Grading */}
      {gradingSubmission && (
        <GradeAssignmentModal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          assignment={gradingSubmission.assignment}
          submission={gradingSubmission.submission}
          onGraded={() => {
            setGradingSubmission(null);
          }}
        />
      )}
    </div>
  );
};
