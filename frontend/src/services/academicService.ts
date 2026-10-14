import { AttendanceRecord, InternalMarkRecord, SemesterMarkRecord, AssignmentMarkRecord, Submission, Assignment } from '../types';

export interface SubjectAttendanceSummary {
  subjectId: string;
  subject: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  neededTo75: number; // how many more consecutive classes needed if < 75%
  canMissFor75: number; // how many can miss while maintaining >= 75%
}

export const AcademicService = {
  calculateStudentAttendance(records: AttendanceRecord[], studentId: string, studentRollNo?: string): {
    overallPercentage: number;
    totalClasses: number;
    totalPresent: number;
    totalAbsent: number;
    subjectSummaries: SubjectAttendanceSummary[];
  } {
    const studentRecords = records.filter(r => r.studentId === studentId || (studentRollNo && r.studentRollNo === studentRollNo));
    if (studentRecords.length === 0) {
      return {
        overallPercentage: 100,
        totalClasses: 0,
        totalPresent: 0,
        totalAbsent: 0,
        subjectSummaries: []
      };
    }

    // Group strictly by subjectId (or subject name as fallback key)
    const subjectMap: Record<string, { subjectId: string; subject: string; total: number; present: number; absent: number }> = {};

    studentRecords.forEach(rec => {
      const key = rec.subjectId || rec.subject;
      if (!subjectMap[key]) {
        subjectMap[key] = { 
          subjectId: rec.subjectId || key, 
          subject: rec.subject, 
          total: 0, 
          present: 0, 
          absent: 0 
        };
      }
      subjectMap[key].total += 1;
      if (rec.status === 'present') {
        subjectMap[key].present += 1;
      } else {
        subjectMap[key].absent += 1;
      }
    });

    const subjectSummaries: SubjectAttendanceSummary[] = Object.values(subjectMap).map(data => {
      const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 100;
      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (pct < 75) status = 'critical';
      else if (pct < 80) status = 'warning';

      // (present + x) / (total + x) >= 0.75  =>  x >= 3*total - 4*present
      let neededTo75 = 0;
      if (pct < 75) {
        neededTo75 = Math.max(0, Math.ceil(3 * data.total - 4 * data.present));
      }

      // present / (total + y) >= 0.75 => y <= (4/3)*present - total
      let canMissFor75 = 0;
      if (pct >= 75) {
        canMissFor75 = Math.max(0, Math.floor((4 / 3) * data.present - data.total));
      }

      return {
        subjectId: data.subjectId,
        subject: data.subject,
        totalClasses: data.total,
        attendedClasses: data.present,
        absentClasses: data.absent,
        percentage: pct,
        status,
        neededTo75,
        canMissFor75
      };
    });

    const totalClasses = studentRecords.length;
    const totalPresent = studentRecords.filter(r => r.status === 'present').length;
    const totalAbsent = studentRecords.filter(r => r.status === 'absent').length;
    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

    return {
      overallPercentage,
      totalClasses,
      totalPresent,
      totalAbsent,
      subjectSummaries
    };
  },

  calculateMarksAnalytics(
    internalMarks: InternalMarkRecord[],
    semesterMarks: SemesterMarkRecord[],
    studentId: string
  ) {
    const studentInternals = internalMarks.filter(m => m.studentId === studentId);
    const studentSemesters = semesterMarks.filter(m => m.studentId === studentId);

    const totalInternalMax = studentInternals.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalInternalObtained = studentInternals.reduce((sum, m) => sum + m.marksObtained, 0);
    const internalPercentage = totalInternalMax > 0 
      ? Math.round((totalInternalObtained / totalInternalMax) * 100) 
      : 0;

    const totalSemesterMax = studentSemesters.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalSemesterObtained = studentSemesters.reduce((sum, m) => sum + m.marksObtained, 0);
    const semesterPercentage = totalSemesterMax > 0 
      ? Math.round((totalSemesterObtained / totalSemesterMax) * 100) 
      : 0;

    return {
      studentInternals,
      studentSemesters,
      internalPercentage,
      totalInternalObtained,
      totalInternalMax,
      semesterPercentage,
      totalSemesterObtained,
      totalSemesterMax
    };
  }
};
