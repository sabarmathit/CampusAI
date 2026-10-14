import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { AttendanceRecord, User } from '../../types';
import { 
  Calendar, 
  Check, 
  X, 
  Save, 
  Users, 
  AlertTriangle,
  History,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const { showToast } = useToast();

  const subjects = [
    'Distributed Systems (CS801)',
    'Advanced Database Systems (CS802)',
    'Cloud Computing (CS803)',
    'Software Project Management (CS804)'
  ];

  const classes = [
    'CSE - Final Year (Section A)',
    'CSE - Final Year (Section B)',
    'IT - Final Year (Section A)',
    'All Enrolled Sections'
  ];

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Record<string, 'present' | 'absent'>>({});
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  if (!currentUser) return null;

  // Load students belonging to this department
  useEffect(() => {
    const studentUsers = allUsers.filter(u => u.role === 'student');
    setStudents(studentUsers);

    // Check if attendance already recorded for this subject & date
    const allAttendance = StorageService.getAttendance();
    const existingForDate = allAttendance.filter(
      r => r.subject === selectedSubject && r.date === selectedDate
    );

    const initialMap: Record<string, 'present' | 'absent'> = {};
    studentUsers.forEach(s => {
      const match = existingForDate.find(r => r.studentId === s.id);
      initialMap[s.id] = match ? match.status : 'present';
    });
    setStatuses(initialMap);

    // History for this subject
    setHistoryRecords(allAttendance.filter(r => r.subject === selectedSubject));
  }, [allUsers, selectedSubject, selectedDate]);

  const toggleStatus = (studentId: string) => {
    setStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setStatuses(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentRollNo: String((student as any).rollNo || '21CS100'),
      department: student.department || 'Computer Science & Engineering',
      subjectId: selectedSubject.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      subject: selectedSubject,
      date: selectedDate,
      status: statuses[student.id] || ('present' as const),
      facultyId: currentUser.id,
      facultyName: currentUser.name
    }));

    StorageService.saveAttendanceBatch(recordsToSave);

    const absentCount = Object.values(statuses).filter(s => s === 'absent').length;
    showToast(
      `Attendance saved for ${selectedSubject} on ${selectedDate}. (${students.length - absentCount} Present, ${absentCount} Absent). Absent students notified.`,
      'success'
    );

    // Refresh history
    const allAttendance = StorageService.getAttendance();
    setHistoryRecords(allAttendance.filter(r => r.subject === selectedSubject));
  };

  const presentCount = Object.values(statuses).filter(s => s === 'present').length;
  const absentCount = Object.values(statuses).filter(s => s === 'absent').length;

  // Attendance summary metrics
  const uniqueDates = Array.from(new Set(historyRecords.map(r => r.date)));
  const totalLogs = historyRecords.length;
  const totalPresentLogs = historyRecords.filter(r => r.status === 'present').length;
  const avgAttendancePct = totalLogs > 0 ? Math.round((totalPresentLogs / totalLogs) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Course & Cohort</span>
          <p className="mt-1 text-sm font-bold text-slate-900 truncate">{selectedSubject.split(' (')[0]}</p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{selectedClass}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sessions Logged</span>
          <p className="mt-1 text-2xl font-extrabold text-blue-600 font-mono">{uniqueDates.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalLogs} student attendance records</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Average Attendance</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">{avgAttendancePct}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Aggregated across all lectures</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Enrolled Strength</span>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">{students.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Students in this department</span>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class / Section
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-end">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'mark'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Logs & History
          </button>
        </div>
      </div>

      {activeTab === 'mark' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Action bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-800">
                Enrolled Students: <span className="font-mono">{students.length}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-medium">
                Present: <span className="font-mono font-bold">{presentCount}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-rose-700 font-medium">
                Absent: <span className="font-mono font-bold">{absentCount}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs flex items-center gap-1.5 ml-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Attendance</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const isPresent = statuses[student.id] === 'present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {(student as any).rollNo || '21CS' + student.id.slice(-3)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.department}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {student.cgpa?.toFixed(2) || '8.00'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPresent 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPresent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleStatus(student.id)}
                          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                            isPresent
                              ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          Mark {isPresent ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History Logs */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-900">
              Recorded Attendance Sessions for {selectedSubject}
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {historyRecords.length} records logged
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Faculty Incharge</th>
                  <th className="py-3 px-4 text-center">Recorded Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      No past records for this subject yet.
                    </td>
                  </tr>
                ) : (
                  historyRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{record.date}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-900 font-medium">{record.studentName}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">{record.facultyName}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          record.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(record.date);
                            setActiveTab('mark');
                          }}
                          className="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 border border-blue-200 rounded font-medium transition-colors cursor-pointer"
                        >
                          Edit Session
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
