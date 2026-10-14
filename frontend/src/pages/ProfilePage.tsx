import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StudentProfileOnboarding } from '../components/student/StudentProfileOnboarding';
import {
  UserCircle,
  Save,
  Plus,
  X,
  Award,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [wizardMode, setWizardMode] = useState(false);

  // Section A: Personal Information
  const [name, setName] = useState(currentUser?.name || '');
  const [registerNumber, setRegisterNumber] = useState(currentUser?.registerNumber || currentUser?.rollNo || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Prefer not to say');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [linkedIn, setLinkedIn] = useState(currentUser?.linkedIn || '');
  const [github, setGithub] = useState(currentUser?.github || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolioUrl || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Section B: Academic Information
  const [collegeName, setCollegeName] = useState(currentUser?.collegeName || 'National Institute of Engineering & Technology');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [degree, setDegree] = useState(currentUser?.degree || 'Bachelor of Engineering (B.E.)');
  const [currentYear, setCurrentYear] = useState<number>(currentUser?.currentYear || 4);
  const [currentSemester, setCurrentSemester] = useState<number>(currentUser?.currentSemester || 8);
  const [graduationYear, setGraduationYear] = useState<number>(currentUser?.graduationYear || 2026);
  const [cgpa, setCgpa] = useState<number>(currentUser?.cgpa || 8.92);
  const [backlogStatus, setBacklogStatus] = useState<'No Backlogs' | 'Active Backlogs' | 'Cleared Backlogs'>(
    currentUser?.backlogStatus || 'No Backlogs'
  );
  const [activeBacklogs, setActiveBacklogs] = useState<number>(currentUser?.activeBacklogs || 0);

  // Skills
  const [skills, setSkills] = useState<string[]>(currentUser?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Role-specific fields
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [officeLocation, setOfficeLocation] = useState(currentUser?.officeLocation || '');
  const [specialization, setSpecialization] = useState(currentUser?.specialization || '');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setRegisterNumber(currentUser.registerNumber || currentUser.rollNo || '');
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setGender(currentUser.gender || 'Prefer not to say');
      setAddress(currentUser.address || '');
      setLinkedIn(currentUser.linkedIn || '');
      setGithub(currentUser.github || '');
      setPortfolioUrl(currentUser.portfolioUrl || '');
      setBio(currentUser.bio || '');

      setCollegeName(currentUser.collegeName || 'National Institute of Engineering & Technology');
      setDepartment(currentUser.department || 'Computer Science & Engineering');
      setDegree(currentUser.degree || 'Bachelor of Engineering (B.E.)');
      setCurrentYear(currentUser.currentYear || 4);
      setCurrentSemester(currentUser.currentSemester || 8);
      setGraduationYear(currentUser.graduationYear || 2026);
      setCgpa(currentUser.cgpa || 8.92);
      setBacklogStatus(currentUser.backlogStatus || 'No Backlogs');
      setActiveBacklogs(currentUser.activeBacklogs || 0);

      setSkills(currentUser.skills || []);
      setDesignation(currentUser.designation || '');
      setCompanyName(currentUser.companyName || '');
      setOfficeLocation(currentUser.officeLocation || '');
      setSpecialization(currentUser.specialization || '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Calculate profile completion percentage
  const fields = [
    name,
    email,
    phone,
    department,
    registerNumber,
    collegeName,
    degree,
    cgpa,
    graduationYear,
    skills.length > 0
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / fields.length) * 100);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim(),
      registerNumber: registerNumber.trim(),
      rollNo: registerNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth,
      gender,
      address: address.trim(),
      linkedIn: linkedIn.trim(),
      github: github.trim(),
      portfolioUrl: portfolioUrl.trim(),
      bio: bio.trim(),
      collegeName: collegeName.trim(),
      department,
      degree: degree.trim(),
      currentYear: Number(currentYear),
      currentSemester: Number(currentSemester),
      graduationYear: Number(graduationYear),
      cgpa: Number(cgpa),
      backlogStatus,
      activeBacklogs: backlogStatus === 'Active Backlogs' ? Number(activeBacklogs) : 0,
      skills,
      designation: designation.trim() || undefined,
      companyName: companyName.trim() || undefined,
      officeLocation: officeLocation.trim() || undefined,
      specialization: specialization.trim() || undefined
    });
    showToast('Profile updated successfully!', 'success');
  };

  if (wizardMode && currentUser.role === 'student') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setWizardMode(false)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch to Standard Form View</span>
          </button>
        </div>
        <StudentProfileOnboarding onComplete={() => setWizardMode(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header card with profile completion */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{name}</h1>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser.role} Account · {currentUser.email}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {department} {registerNumber ? `· Reg: ${registerNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Profile Completion Indicator & Wizard launcher */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="w-full sm:w-48 bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Profile Strength</span>
              <span className="font-mono font-bold text-emerald-700">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">Complete all profile attributes for campus verification.</p>
          </div>

          {currentUser.role === 'student' && (
            <button
              onClick={() => setWizardMode(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch 3-Section Profile Onboarding Wizard →</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Section A: Personal Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <span>Section A: Personal & Contact Information</span>
            <span className="text-[10px] font-normal text-slate-400 capitalize">Editable Anytime</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Register Number / Roll No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 21CS104"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Current residential address"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL (Optional)
              </label>
              <input
                type="url"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Profile URL (Optional)
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio URL (Optional)
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://portfolio.dev"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Summary / Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Outline your engineering interests, key technical capabilities, and career goals..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section B: Academic Information */}
        {currentUser.role === 'student' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span>Section B: Academic Information</span>
              <span className="text-[10px] font-normal text-slate-400">Used for Mandatory Placement Eligibility</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Discipline <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year & Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg font-mono text-center"
                    placeholder="Year"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg font-mono text-center"
                    placeholder="Sem"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative CGPA (Scale of 10.0) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Backlog Status
                </label>
                <select
                  value={backlogStatus}
                  onChange={(e) => setBacklogStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="No Backlogs">No Backlogs</option>
                  <option value="Active Backlogs">Active Backlogs</option>
                  <option value="Cleared Backlogs">Cleared Backlogs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Backlogs Count
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={backlogStatus !== 'Active Backlogs'}
                  value={activeBacklogs}
                  onChange={(e) => setActiveBacklogs(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Extracurricular summary notice */}
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900 block">Section C: Extracurricular Activities</span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  {currentUser.extracurriculars?.length || 0} activities recorded (Hackathons, Clubs, Certifications, Leadership).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWizardMode(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Manage Activities in Wizard →
              </button>
            </div>
          </div>
        )}

        {/* Non-Student Role Specific Fields */}
        {currentUser.role === 'faculty' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {currentUser.role === 'recruiter' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {currentUser.role === 'placement' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placement Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Location
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};
