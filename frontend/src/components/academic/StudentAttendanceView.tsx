import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { AcademicService } from '../../services/academicService';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  BookOpen, 
  BarChart2 
} from 'lucide-react';

export const StudentAttendanceView: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const [dataVersion, setDataVersion] = React.useState(0);
  React.useEffect(() => {
    const handler = () => setDataVersion(v => v + 1);
    window.addEventListener('campus_storage_update', handler);
    return () => window.removeEventListener('campus_storage_update', handler);
  }, []);

  const allAttendance = StorageService.getAttendance();
  const studentRecords = allAttendance.filter(
    r => r.studentId === currentUser.id || (currentUser.rollNo && r.studentRollNo === currentUser.rollNo)
  );

  const metrics = useMemo(() => {
    return AcademicService.calculateStudentAttendance(allAttendance, currentUser.id, currentUser.rollNo);
  }, [allAttendance, currentUser.id, currentUser.rollNo, dataVersion]);

  const isLowOverall = metrics.overallPercentage < 75;

  return (
    <div className="space-y-6">
      {/* Overview Stat Card */}
      <div className={`p-5 rounded-xl border ${
        isLowOverall 
          ? 'bg-rose-50/70 border-rose-200' 
          : metrics.overallPercentage < 80 
          ? 'bg-amber-50/70 border-amber-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overall Attendance Progress
              </span>
              {isLowOverall && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                  Below Mandate (75%)
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                {metrics.overallPercentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({metrics.totalPresent} attended out of {metrics.totalClasses} total lectures)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {isLowOverall
                ? '⚠️ You have an attendance shortage. Attend consecutive upcoming classes to regain eligibility.'
                : '✅ You satisfy the university requirement of 75% attendance for semester exam registration.'}
            </p>
          </div>

          <div className="w-full sm:w-48 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shrink-0">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLowOverall ? 'bg-rose-500' : metrics.overallPercentage < 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject-Wise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.subjectSummaries.map((summary) => {
          const isCritical = summary.status === 'critical';
          const isWarning = summary.status === 'warning';

          return (
            <div
              key={summary.subject}
              className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                isCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                    {summary.subject}
                  </h4>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-800' 
                      : isWarning 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {summary.percentage}%
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Attended: <strong className="text-slate-800 font-mono">{summary.attendedClasses}</strong> / {summary.totalClasses}</span>
                  <span className="capitalize text-[11px] font-medium text-slate-400">{summary.status} Standing</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, summary.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Actionable math footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
                {isCritical ? (
                  <p className="text-rose-700 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Must attend next <strong className="font-mono">{summary.neededTo75}</strong> consecutive classes to reach 75%.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    You can miss up to <strong className="font-mono text-slate-700">{summary.canMissFor75}</strong> more classes and remain $\ge$75%.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Student's Recent Attendance Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-900">Your Individual Attendance Record Log</h4>
          <span className="text-xs text-slate-500 font-mono">{studentRecords.length} lectures logged</span>
        </div>

        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Faculty</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                    No attendance records logged for your profile yet.
                  </td>
                </tr>
              ) : (
                studentRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-4 font-semibold text-slate-800">{rec.date}</td>
                    <td className="py-2 px-4 font-sans text-slate-900">{rec.subject}</td>
                    <td className="py-2 px-4 font-sans text-slate-600">{rec.facultyName}</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        rec.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {rec.status === 'present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {rec.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
