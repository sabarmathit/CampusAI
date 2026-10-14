import { User, JobPost, Application } from '../types';

export type EligibilityStatus = 'Eligible' | 'Ineligible' | 'Profile Incomplete' | 'Resume Required';

export interface CandidateMatchResult {
  student: User;
  status: EligibilityStatus;
  isEligible: boolean;
  isProfileIncomplete: boolean;
  isResumeMissing: boolean;
  ineligibilityReasons: string[];
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchPercentage: number;
  hasProjectEvidence: boolean;
  hasExperienceEvidence: boolean;
  stage: 'Not Applied' | 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'On Hold';
  existingApplication?: Application;
}

export const normalizeDepartment = (dept: string): string => {
  const d = (dept || '').toLowerCase().trim();
  if (d.includes('computer') || d.includes('cse') || d === 'cs') return 'cse';
  if (d.includes('information') || d.includes('it') || d.includes('infotech')) return 'it';
  if (d.includes('electronics') || d.includes('communication') || d.includes('ece') || d === 'ec') return 'ece';
  if (d.includes('electrical') || d.includes('eee') || d === 'ee') return 'eee';
  if (d.includes('mechanical') || d.includes('mech') || d === 'me') return 'mech';
  if (d.includes('civil') || d === 'ce') return 'civil';
  return d;
};

export const PlacementService = {
  evaluateCandidate(student: User, job: JobPost, existingApp?: Application): CandidateMatchResult {
    const ineligibilityReasons: string[] = [];

    // 0. Check Profile Completeness
    const isProfileIncomplete = !student.profileCompleted && (
      !student.department ||
      student.cgpa === undefined ||
      !student.graduationYear
    );

    // 0b. Check Resume Presence
    const isResumeMissing = !student.resume || !student.resume.extractedSkills || student.resume.extractedSkills.length === 0;

    // 1. Mandatory CGPA check
    const studentCGPA = Number(student.cgpa || 0);
    const minCGPA = Number(job.minCGPA || 0);
    if (minCGPA > 0) {
      if (student.cgpa === undefined) {
        ineligibilityReasons.push('CGPA information is missing in student profile.');
      } else if (studentCGPA < minCGPA) {
        ineligibilityReasons.push(`Your CGPA (${studentCGPA.toFixed(2)}) is below the mandatory minimum requirement of ${minCGPA.toFixed(2)}.`);
      }
    }

    // 2. Mandatory Department check
    const rawStudentDept = student.department || '';
    const studentNormDept = normalizeDepartment(rawStudentDept);
    const eligibleDepts = job.eligibleDepartments || [];

    const isOpenToAll = eligibleDepts.length === 0 || 
      eligibleDepts.some(d => d.toLowerCase().includes('all') || d.toLowerCase().includes('open'));

    if (!isOpenToAll) {
      if (!rawStudentDept) {
        ineligibilityReasons.push('Department information is missing in student profile.');
      } else {
        const jobEligibleNormDepts = eligibleDepts.map(normalizeDepartment);
        const deptMatches = jobEligibleNormDepts.includes(studentNormDept) ||
          eligibleDepts.some(ed => rawStudentDept.toLowerCase().includes(ed.toLowerCase()) || ed.toLowerCase().includes(rawStudentDept.toLowerCase()));

        if (!deptMatches) {
          ineligibilityReasons.push(`Your department "${student.department}" is not eligible for this role (Eligible: ${eligibleDepts.join(', ')}).`);
        }
      }
    }

    // 3. Mandatory Graduation Year check
    if (job.graduationYear && job.graduationYear > 0) {
      const studentGradYear = Number(student.graduationYear || 0);
      const jobGradYear = Number(job.graduationYear);
      if (!studentGradYear) {
        ineligibilityReasons.push('Graduation year is not specified in student profile.');
      } else if (studentGradYear !== jobGradYear) {
        ineligibilityReasons.push(`Your graduation year (${studentGradYear}) does not match the required batch (${jobGradYear}).`);
      }
    }

    // 4. Backlog check (strict corporate requirement: 0 active backlogs)
    if (student.backlogStatus === 'Active Backlogs' || (student.activeBacklogs && student.activeBacklogs > 0)) {
      const backlogs = student.activeBacklogs || 1;
      ineligibilityReasons.push(`Active backlogs detected (${backlogs} active backlog${backlogs > 1 ? 's' : ''}). The company requires 0 active backlogs.`);
    }

    // 5. Skill Match Analysis (Resume is the primary source!)
    const resumeSkills = student.resume?.extractedSkills || [];
    const normalizedResumeSkills = resumeSkills.map(s => s.trim().toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    (job.requiredSkills || []).forEach(skill => {
      const sLower = skill.trim().toLowerCase();
      const hasSkill = normalizedResumeSkills.some(rSkill => 
        rSkill === sLower || 
        rSkill.includes(sLower) || 
        sLower.includes(rSkill)
      );

      if (hasSkill) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Check project and experience evidence in resume
    const projects = student.resume?.projects || [];
    const experience = student.resume?.experience || [];

    const hasProjectEvidence = projects.some(p => 
      p.techStack?.some(t => job.requiredSkills.some(req => req.toLowerCase() === t.toLowerCase())) ||
      job.requiredSkills.some(req => p.description.toLowerCase().includes(req.toLowerCase()))
    );

    const hasExperienceEvidence = experience.length > 0;

    const requiredSkillsCount = (job.requiredSkills || []).length;
    let skillMatchPercentage = 0;

    if (isResumeMissing) {
      skillMatchPercentage = 0;
    } else if (requiredSkillsCount === 0) {
      skillMatchPercentage = 100;
    } else {
      let score = (matchedSkills.length / requiredSkillsCount) * 100;
      // Bonus evidence credit (up to 5%)
      if (hasProjectEvidence) score = Math.min(100, score + 5);
      if (hasExperienceEvidence) score = Math.min(100, score + 5);
      skillMatchPercentage = Math.round(score);
    }

    // Determine overall EligibilityStatus
    let status: EligibilityStatus = 'Eligible';
    if (isProfileIncomplete) {
      status = 'Profile Incomplete';
    } else if (ineligibilityReasons.length > 0) {
      status = 'Ineligible';
    } else if (isResumeMissing) {
      status = 'Resume Required';
    } else {
      status = 'Eligible';
    }

    const isEligible = status === 'Eligible';

    // Construct Transparent Human-Readable Explanation
    let explanation = '';
    if (status === 'Profile Incomplete') {
      explanation = 'Your academic profile is incomplete. Please complete your profile to verify mandatory eligibility.';
    } else if (status === 'Resume Required') {
      explanation = 'Your academic profile meets mandatory criteria, but no resume has been uploaded. Upload your resume to extract skills and check skill match.';
    } else if (status === 'Ineligible') {
      explanation = ineligibilityReasons.join(' ');
    } else {
      // Eligible
      if (missingSkills.length === 0) {
        explanation = 'Your academic profile satisfies all mandatory criteria, and your resume matches 100% of required technical skills.';
      } else {
        explanation = `Your academic profile satisfies all mandatory criteria. Your resume matches ${matchedSkills.join(', ')}, but ${missingSkills.join(', ')} ${missingSkills.length > 1 ? 'are' : 'is'} not identified.`;
      }
    }

    // Candidate Stage
    let stage: CandidateMatchResult['stage'] = 'Not Applied';
    if (existingApp) {
      if (existingApp.status === 'Selected') {
        stage = 'Selected';
      } else if (existingApp.status === 'Rejected') {
        stage = 'Rejected';
      } else if (existingApp.status === 'On Hold') {
        stage = 'On Hold';
      } else if (existingApp.status === 'Interviewing' || (existingApp.interviewRounds && existingApp.interviewRounds.length > 0)) {
        stage = 'Interview Scheduled';
      } else if (existingApp.status === 'Shortlisted') {
        stage = 'Shortlisted';
      } else {
        stage = 'Applied';
      }
    }

    return {
      student,
      status,
      isEligible,
      isProfileIncomplete,
      isResumeMissing,
      ineligibilityReasons,
      explanation,
      matchedSkills,
      missingSkills,
      skillMatchPercentage,
      hasProjectEvidence,
      hasExperienceEvidence,
      stage,
      existingApplication: existingApp
    };
  },

  matchAllStudentsForJob(
    students: User[], 
    job: JobPost, 
    allApplications: Application[] = []
  ): {
    eligible: CandidateMatchResult[];
    ineligible: CandidateMatchResult[];
  } {
    const studentUsers = students.filter(u => u.role === 'student');
    const eligible: CandidateMatchResult[] = [];
    const ineligible: CandidateMatchResult[] = [];

    studentUsers.forEach(student => {
      const existingApp = allApplications.find(a => a.jobId === job.id && a.studentId === student.id);
      const match = this.evaluateCandidate(student, job, existingApp);
      if (match.isEligible) {
        eligible.push(match);
      } else {
        ineligible.push(match);
      }
    });

    // Sort eligible by skill match descending, then CGPA descending
    eligible.sort((a, b) => {
      if (b.skillMatchPercentage !== a.skillMatchPercentage) {
        return b.skillMatchPercentage - a.skillMatchPercentage;
      }
      return (b.student.cgpa || 0) - (a.student.cgpa || 0);
    });

    // Sort ineligible by skill match descending
    ineligible.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);

    return { eligible, ineligible };
  }
};
