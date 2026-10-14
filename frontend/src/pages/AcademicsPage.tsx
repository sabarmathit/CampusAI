import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { StudentAttendanceView } from '../components/academic/StudentAttendanceView';
import { AttendanceManager } from '../components/academic/AttendanceManager';
import { SubmitAssignmentModal } from '../components/academic/SubmitAssignmentModal';
import { CreateAssignmentModal } from '../components/academic/CreateAssignmentModal';
import { GradeAssignmentModal } from '../components/academic/GradeAssignmentModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Assignment, Submission } from '../types';
import {
  GraduationCap,
  ClipboardList,
  UserCheck,
  BookOpen,
  Calendar,
  Plus,
  Paperclip,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';

export const AcademicsPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = useState(0);
  React.useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as any) || (location.pathname.includes('attendance') ? 'attendance' : 'assignments');
  const [activeTab, setActiveTab] = useState<'assignments' | 'attendance' | 'subjects' | 'progress'>(initialTab);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam && ['assignments', 'attendance', 'subjects', 'progress'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    } else if (location.pathname.includes('attendance')) {
      setActiveTab('attendance');
    }
  }, [location]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitModalAsg, setSubmitModalAsg] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | undefined>(undefined);
  const [gradingModalData, setGradingModalData] = useState<{
    assignment: Assignment;
    submission: Submission;
  } | null>(null);

  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();

  // Find user submission for an assignment with resilient student ID or rollNo match
  const getStudentSubmission = (asgId: string): Submission | undefined => {
    return submissions.find(
      s => s.assignmentId === asgId && (
        s.studentId === currentUser.id ||
        (currentUser.rollNo && s.studentRollNo === currentUser.rollNo)
      )
    );
  };

  const filteredAssignments = assignments.filter(asg => {
    if (currentUser.role === 'student') {
      const sub = getStudentSubmission(asg.id);
      if (assignmentFilter === 'pending') return !sub;
      if (assignmentFilter === 'submitted') return sub && sub.status === 'submitted';
      if (assignmentFilter === 'graded') return sub && sub.status === 'graded';
    }
    return true;
  });

  const subjectsData = [
    { code: 'CS801', title: 'Distributed Systems', faculty: 'Dr. Sundar Rajan', credits: 4, schedule: 'Mon, Wed 10:00 AM' },
    { code: 'CS802', title: 'Advanced Database Systems', faculty: 'Dr. Sundar Rajan', credits: 4, schedule: 'Tue, Thu 11:30 AM' },
    { code: 'CS803', title: 'Cloud Computing & DevOps', faculty: 'Prof. Meenakshi Sundaram', credits: 3, schedule: 'Wed, Fri 02:00 PM' },
    { code: 'CS804', title: 'Software Project Management', faculty: 'Prof. Meenakshi Sundaram', credits: 3, schedule: 'Mon, Thu 03:30 PM' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Academic Operations & Course Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curriculum courses, laboratory assignments, lecture attendance, and performance metrics.
            </p>
          </div>

          {currentUser.role === 'faculty' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Assignment</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Assignments & Lab Work</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Lecture Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'subjects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Syllabus</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Academic Performance</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {currentUser.role === 'student' && (
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg w-fit">
              {(['all', 'pending', 'submitted', 'graded'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setAssignmentFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    assignmentFilter === filter
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map(asg => {
              const mySub = getStudentSubmission(asg.id);
              const asgSubmissions = submissions.filter(s => s.assignmentId === asg.id);

              return (
                <div
                  key={asg.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {asg.subject}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {asg.maxMarks} Marks
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{asg.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{asg.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due: {asg.dueDate}
                      </span>
                      <span>·</span>
                      <span>Faculty: {asg.facultyName}</span>
                    </div>
                  </div>

                  {/* Student View Action */}
                  {currentUser.role === 'student' && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      {mySub ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={mySub.status} size="sm" />
                          {mySub.status === 'graded' && (
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {mySub.marksObtained} / {asg.maxMarks} Marks
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-rose-600 font-medium">
                          Submission Pending
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setSubmitModalAsg(asg);
                          setExistingSubmission(mySub);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                          mySub 
                            ? 'text-slate-700 bg-slate-100 hover:bg-slate-200' 
                            : 'text-white bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {mySub ? 'View / Re-submit' : 'Submit Assignment'}
                      </button>
                    </div>
                  )}

                  {/* Faculty View Action */}
                  {currentUser.role === 'faculty' && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>
                          Submissions: <strong className="text-slate-900">{asgSubmissions.length}</strong>
                        </span>
                        <span>
                          Graded: <strong className="text-emerald-700">{asgSubmissions.filter(s => s.status === 'graded').length}</strong>
                        </span>
                      </div>

                      {asgSubmissions.length > 0 && (
                        <div className="pt-2 divide-y divide-slate-100">
                          {asgSubmissions.map(sub => (
                            <div key={sub.id} className="py-1.5 flex items-center justify-between text-xs">
                              <span className="truncate">{sub.studentName}</span>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={sub.status} size="sm" />
                                <button
                                  onClick={() => setGradingModalData({ assignment: asg, submission: sub })}
                                  className="text-[11px] text-emerald-600 hover:underline font-semibold"
                                >
                                  {sub.status === 'graded' ? 'Update Grade' : 'Grade'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        currentUser.role === 'faculty' ? (
          <AttendanceManager />
        ) : (
          <StudentAttendanceView />
        )
      )}

      {/* Tab 3: Subjects & Curriculum */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectsData.map(sub => (
            <div key={sub.code} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {sub.code}
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">
                  {sub.credits} Credits
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{sub.title}</h3>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Faculty:</strong> {sub.faculty}</p>
                <p><strong>Lecture Timetable:</strong> {sub.schedule}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Academic Progress */}
      {activeTab === 'progress' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium uppercase">Graduation CGPA</span>
              <p className="mt-1 text-2xl font-bold font-mono text-blue-600">{currentUser.cgpa?.toFixed(2) || '8.92'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Top 5% of graduating cohort</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium uppercase">Total Credits Earned</span>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900">142 / 160</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Final semester in progress</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium uppercase">Academic Standing</span>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600">Exemplary</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No backlogs / clean record</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {submitModalAsg && (
        <SubmitAssignmentModal
          isOpen={!!submitModalAsg}
          onClose={() => setSubmitModalAsg(null)}
          assignment={submitModalAsg}
          existingSubmission={existingSubmission}
          onSubmitted={() => {
            setSubmitModalAsg(null);
          }}
        />
      )}

      <CreateAssignmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {}}
      />

      {gradingModalData && (
        <GradeAssignmentModal
          isOpen={!!gradingModalData}
          onClose={() => setGradingModalData(null)}
          assignment={gradingModalData.assignment}
          submission={gradingModalData.submission}
          onGraded={() => {
            setGradingModalData(null);
          }}
        />
      )}
    </div>
  );
};
