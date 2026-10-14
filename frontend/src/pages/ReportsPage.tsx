import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storageService';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Award
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState<'placement' | 'attendance' | 'applications'>('placement');

  const jobs = StorageService.getJobPosts();
  const applications = StorageService.getApplications();
  const attendance = StorageService.getAttendance();
  const users = StorageService.getUsers().filter(u => u.role === 'student');

  const handleExportCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully!`, 'success');
  };

  const exportPlacementReport = () => {
    let csv = 'Application ID,Student Name,Roll No,Company,Job Title,Status,CGPA\n';
    applications.forEach(a => {
      csv += `"${a.id}","${a.studentName}","${a.studentRollNo}","${a.company}","${a.jobTitle}","${a.status}","${a.studentCGPA}"\n`;
    });
    handleExportCSV('Campus_Placement_Drives_Report_2026.csv', csv);
  };

  const exportAttendanceReport = () => {
    let csv = 'Record ID,Date,Student Name,Roll No,Subject,Status,Faculty\n';
    attendance.forEach(att => {
      csv += `"${att.id}","${att.date}","${att.studentName}","${att.studentRollNo}","${att.subject}","${att.status}","${att.facultyName}"\n`;
    });
    handleExportCSV('Campus_Attendance_Telemetry_Report.csv', csv);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Academic & Placement Analytical Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional summaries, department salary benchmarks, attendance audits, and CSV export utilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={reportType === 'attendance' ? exportAttendanceReport : exportPlacementReport}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg w-fit">
        <button
          onClick={() => setReportType('placement')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            reportType === 'placement' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Placement & Offers Report
        </button>
        <button
          onClick={() => setReportType('attendance')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            reportType === 'attendance' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Audits
        </button>
      </div>

      {/* Placement Report View */}
      {reportType === 'placement' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Campus Registered</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{users.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Class of 2026</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Offers Extended</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {applications.filter(a => a.status === 'Selected').length || 1}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tier 1 & Product Core</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Average Package</span>
              <p className="text-2xl font-bold font-mono text-purple-600 mt-1">₹15.8 LPA</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Core SDE Profiles</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Highest CTC</span>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">₹21.0 LPA</p>
              <p className="text-[10px] text-slate-400 mt-0.5">CloudScale Global</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Student Placement Drive Summary
              </h3>
              <span className="text-xs text-slate-500 font-mono">{applications.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4 text-center">Recruitment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {app.studentName} <span className="font-mono text-slate-400 font-normal">({app.studentRollNo})</span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">{app.company}</td>
                      <td className="py-2.5 px-4 text-slate-600">{app.jobTitle}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{app.studentCGPA.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Report View */}
      {reportType === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lecture Attendance Logs ({attendance.length} Sessions)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Real-time sync</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-sans">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{r.date}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-800 font-medium">{r.studentName}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">{r.subject}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">{r.facultyName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
