import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { AcademicService } from '../services/academicService';
import { Users, Search, GraduationCap, AlertTriangle, CheckCircle2, Mail, Phone } from 'lucide-react';

export const FacultyStudentsPage: React.FC = () => {
  const { allUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const attendance = StorageService.getAttendance();
  const students = allUsers.filter(u => u.role === 'student');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Enrolled Students Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic standing, attendance compliance, and technical skill profiles for assigned batches.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name or roll..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map(student => {
          const metrics = AcademicService.calculateStudentAttendance(attendance, student.id);
          const isLowAttendance = metrics.overallPercentage < 75;

          return (
            <div
              key={student.id}
              className={`bg-white border rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all ${
                isLowAttendance ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{(student as any).rollNo || '21CS104'} · {student.department}</p>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                  isLowAttendance
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {metrics.overallPercentage}% Attendance
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
                  <span className="font-mono font-bold text-slate-800">{student.cgpa?.toFixed(2) || '8.50'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Batch</span>
                  <span className="font-mono font-bold text-slate-800">{student.graduationYear || 2026}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {(student.skills || []).slice(0, 4).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                {isLowAttendance && (
                  <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Attendance Shortage
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
