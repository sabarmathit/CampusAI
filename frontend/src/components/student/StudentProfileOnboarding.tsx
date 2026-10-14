import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { ExtracurricularActivity } from '../../types';
import {
  Sparkles,
  User,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calendar,
  Phone,
  Mail,
  Building,
  FileCheck,
  Globe,
  Github,
  Linkedin,
  Clock
} from 'lucide-react';

interface StudentProfileOnboardingProps {
  onComplete?: () => void;
}

export const StudentProfileOnboarding: React.FC<StudentProfileOnboardingProps> = ({ onComplete }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<'personal' | 'academic' | 'extracurricular'>('personal');

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

  // Section B: Academic Information
  const [collegeName, setCollegeName] = useState(currentUser?.collegeName || 'National Institute of Engineering & Technology');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [degree, setDegree] = useState(currentUser?.degree || 'Bachelor of Engineering (B.E.)');
  const [currentYear, setCurrentYear] = useState<number>(currentUser?.currentYear || 4);
  const [currentSemester, setCurrentSemester] = useState<number>(currentUser?.currentSemester || 7);
  const [graduationYear, setGraduationYear] = useState<number>(currentUser?.graduationYear || 2026);
  const [cgpa, setCgpa] = useState<string>(currentUser?.cgpa !== undefined ? String(currentUser.cgpa) : '8.50');
  const [backlogStatus, setBacklogStatus] = useState<'No Backlogs' | 'Active Backlogs' | 'Cleared Backlogs'>(
    currentUser?.backlogStatus || 'No Backlogs'
  );
  const [activeBacklogs, setActiveBacklogs] = useState<number>(currentUser?.activeBacklogs || 0);

  // Section C: Extracurricular Activities
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularActivity[]>(
    currentUser?.extracurriculars || []
  );

  // New extracurricular item form state
  const [showAddEc, setShowAddEc] = useState(false);
  const [ecTitle, setEcTitle] = useState('');
  const [ecCategory, setEcCategory] = useState<ExtracurricularActivity['category']>('Technical');
  const [ecDescription, setEcDescription] = useState('');
  const [ecDate, setEcDate] = useState('');

  // Validation error tracking
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setRegisterNumber(currentUser.registerNumber || currentUser.rollNo || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setGender(currentUser.gender || 'Prefer not to say');
      setAddress(currentUser.address || '');
      setLinkedIn(currentUser.linkedIn || '');
      setGithub(currentUser.github || '');
      setPortfolioUrl(currentUser.portfolioUrl || '');
      setCollegeName(currentUser.collegeName || 'National Institute of Engineering & Technology');
      setDepartment(currentUser.department || 'Computer Science & Engineering');
      setDegree(currentUser.degree || 'Bachelor of Engineering (B.E.)');
      setCurrentYear(currentUser.currentYear || 4);
      setCurrentSemester(currentUser.currentSemester || 7);
      setGraduationYear(currentUser.graduationYear || 2026);
      if (currentUser.cgpa !== undefined) setCgpa(String(currentUser.cgpa));
      setBacklogStatus(currentUser.backlogStatus || 'No Backlogs');
      setActiveBacklogs(currentUser.activeBacklogs || 0);
      setExtracurriculars(currentUser.extracurriculars || []);
    }
  }, [currentUser]);

  // Calculate completion percentage based on essential fields
  const requiredFields = [
    { key: 'name', val: name.trim() },
    { key: 'registerNumber', val: registerNumber.trim() },
    { key: 'email', val: email.trim() },
    { key: 'phone', val: phone.trim() },
    { key: 'dateOfBirth', val: dateOfBirth.trim() },
    { key: 'address', val: address.trim() },
    { key: 'collegeName', val: collegeName.trim() },
    { key: 'department', val: department.trim() },
    { key: 'degree', val: degree.trim() },
    { key: 'currentYear', val: !!currentYear },
    { key: 'currentSemester', val: !!currentSemester },
    { key: 'graduationYear', val: !!graduationYear },
    { key: 'cgpa', val: !!cgpa && !isNaN(Number(cgpa)) && Number(cgpa) >= 0 && Number(cgpa) <= 10 }
  ];

  const completedCount = requiredFields.filter(f => Boolean(f.val)).length;
  // Extracurriculars give bonus completeness
  const ecBonus = extracurriculars.length > 0 ? 1 : 0;
  const totalWeight = requiredFields.length + 1;
  const completionPercentage = Math.min(100, Math.round(((completedCount + ecBonus) / totalWeight) * 100));

  const validatePersonal = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!registerNumber.trim()) errs.registerNumber = 'Register / Roll Number is required';
    if (!email.trim()) errs.email = 'Valid email is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!dateOfBirth.trim()) errs.dateOfBirth = 'Date of birth is required';
    if (!address.trim()) errs.address = 'Current address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAcademic = (): boolean => {
    const errs: Record<string, string> = {};
    if (!collegeName.trim()) errs.collegeName = 'College name is required';
    if (!department.trim()) errs.department = 'Department is required';
    if (!degree.trim()) errs.degree = 'Degree program is required';

    const numCgpa = Number(cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      errs.cgpa = 'CGPA must be a valid number between 0.00 and 10.00';
    }

    if (graduationYear < 2024 || graduationYear > 2032) {
      errs.graduationYear = 'Enter a valid graduation year (e.g. 2026)';
    }

    if (backlogStatus === 'Active Backlogs' && activeBacklogs <= 0) {
      errs.activeBacklogs = 'Please enter the number of active backlogs';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const collectProfileData = (isComplete: boolean = false) => {
    return {
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
      collegeName: collegeName.trim(),
      department: department.trim(),
      degree: degree.trim(),
      currentYear: Number(currentYear),
      currentSemester: Number(currentSemester),
      graduationYear: Number(graduationYear),
      cgpa: Number(cgpa),
      backlogStatus,
      activeBacklogs: backlogStatus === 'Active Backlogs' ? Number(activeBacklogs) : 0,
      extracurriculars,
      profileCompleted: isComplete
    };
  };

  const handleSaveDraft = () => {
    if (!currentUser) return;
    const draft = collectProfileData(false);
    updateCurrentUser(draft);
    showToast('Profile draft saved successfully. You can resume anytime.', 'info');
  };

  const handleAddExtracurricular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecTitle.trim()) {
      showToast('Please enter an activity title', 'error');
      return;
    }

    const newEc: ExtracurricularActivity = {
      id: `ec-${Date.now()}`,
      title: ecTitle.trim(),
      category: ecCategory,
      description: ecDescription.trim(),
      date: ecDate || new Date().toISOString().split('T')[0]
    };

    setExtracurriculars(prev => [...prev, newEc]);
    setEcTitle('');
    setEcDescription('');
    setEcDate('');
    setShowAddEc(false);
    showToast('Activity added to profile!', 'success');
  };

  const handleRemoveExtracurricular = (id: string) => {
    setExtracurriculars(prev => prev.filter(item => item.id !== id));
  };

  const handleNext = () => {
    if (activeSection === 'personal') {
      if (!validatePersonal()) {
        showToast('Please fill all required personal information fields', 'error');
        return;
      }
      handleSaveDraft();
      setActiveSection('academic');
    } else if (activeSection === 'academic') {
      if (!validateAcademic()) {
        showToast('Please resolve validation errors in academic information', 'error');
        return;
      }
      handleSaveDraft();
      setActiveSection('extracurricular');
    }
  };

  const handleCompleteProfile = () => {
    const isPersonalValid = validatePersonal();
    const isAcademicValid = validateAcademic();

    if (!isPersonalValid) {
      setActiveSection('personal');
      showToast('Please complete required fields in Personal Information', 'error');
      return;
    }

    if (!isAcademicValid) {
      setActiveSection('academic');
      showToast('Please complete required fields in Academic Information', 'error');
      return;
    }

    const finalizedProfile = collectProfileData(true);
    updateCurrentUser(finalizedProfile);
    showToast('🎉 Profile successfully completed! Welcome to your student portal.', 'success');

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Student Onboarding Process</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome! Let's Complete Your Profile
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
            Complete your profile to receive personalized academic insights, resume analysis, internship recommendations, and placement opportunities.
          </p>

          {/* Progress Bar */}
          <div className="pt-4 border-t border-white/15 space-y-2 max-w-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-200">Profile Completion Readiness</span>
              <span className="font-mono font-bold text-white text-sm">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden backdrop-blur-xs">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercentage >= 80 ? 'bg-emerald-400' : completionPercentage >= 50 ? 'bg-amber-400' : 'bg-blue-400'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('personal')}
          className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'personal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Section A:</span>
          <span>Personal Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('academic')}
          className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'academic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden sm:inline">Section B:</span>
          <span>Academic Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('extracurricular')}
          className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'extracurricular'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span className="hidden sm:inline">Section C:</span>
          <span>Extracurriculars</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* ======================================================== */}
        {/* SECTION A: PERSONAL INFORMATION */}
        {/* ======================================================== */}
        {activeSection === 'personal' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Section A: Personal Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official student identity records, contact channels, and portfolio links.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sabarmathi T"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.name ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Register / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. 21CS104"
                  className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.registerNumber ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.registerNumber && <p className="text-[10px] text-rose-600 mt-1">{errors.registerNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional / Primary Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.email ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                    errors.dateOfBirth ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-[10px] text-rose-600 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Residential / Campus Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Room 402, Technology Hostel Block B, NIET Campus, Bengaluru"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.address ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.address && <p className="text-[10px] text-rose-600 mt-1">{errors.address}</p>}
              </div>
            </div>

            {/* Online Professional Profiles (Optional) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Professional & Social Profiles (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3 text-slate-900" />
                    <span>GitHub Profile</span>
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Portfolio Website</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://portfolio.dev"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION B: ACADEMIC INFORMATION */}
        {/* ======================================================== */}
        {activeSection === 'academic' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Section B: Academic Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Degree program, department, graduation year, CGPA, and backlog compliance records.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University Institution <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. National Institute of Engineering & Technology"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.collegeName ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.collegeName && <p className="text-[10px] text-rose-600 mt-1">{errors.collegeName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Engineering (B.E.)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year of Study <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-mono"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={2024}
                  max={2032}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                {errors.graduationYear && <p className="text-[10px] text-rose-600 mt-1">{errors.graduationYear}</p>}
              </div>

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
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="8.50"
                  className={`w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.cgpa ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.cgpa && <p className="text-[10px] text-rose-600 mt-1">{errors.cgpa}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Backlog Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={backlogStatus}
                  onChange={(e) => {
                    const st = e.target.value as 'No Backlogs' | 'Active Backlogs' | 'Cleared Backlogs';
                    setBacklogStatus(st);
                    if (st !== 'Active Backlogs') setActiveBacklogs(0);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="No Backlogs">No Backlogs (Clean Record)</option>
                  <option value="Active Backlogs">Active Backlogs Present</option>
                  <option value="Cleared Backlogs">Cleared Backlogs (Past History)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Active Backlogs
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={backlogStatus !== 'Active Backlogs'}
                  value={activeBacklogs}
                  onChange={(e) => setActiveBacklogs(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-1 ${
                    backlogStatus !== 'Active Backlogs' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                {errors.activeBacklogs && <p className="text-[10px] text-rose-600 mt-1">{errors.activeBacklogs}</p>}
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Academic Verification Rule:</strong> Corporate recruiters filter applicants strictly based on CGPA cutoffs and active backlog tolerances. Ensure your reported scores match your official university transcripts.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION C: EXTRACURRICULAR ACTIVITIES */}
        {/* ======================================================== */}
        {activeSection === 'extracurricular' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Section C: Extracurricular Activities</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Technical activities, club leadership, hackathons, certifications, and achievements.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddEc(!showAddEc)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>
            </div>

            {/* Add activity form modal/inline box */}
            {showAddEc && (
              <form onSubmit={handleAddExtracurricular} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Add Activity or Achievement
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Title / Role / Honor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ecTitle}
                      onChange={(e) => setEcTitle(e.target.value)}
                      placeholder="e.g. Lead Organizer - Smart India Hackathon"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={ecCategory}
                      onChange={(e) => setEcCategory(e.target.value as ExtracurricularActivity['category'])}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                    >
                      <option value="Technical">Technical Activity</option>
                      <option value="Club Membership">Club Membership</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Competition">Competition</option>
                      <option value="Certification">Certification</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Leadership">Leadership Experience</option>
                      <option value="Volunteering">Volunteering</option>
                      <option value="Achievement">Achievement / Award</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Date / Period
                    </label>
                    <input
                      type="date"
                      value={ecDate}
                      onChange={(e) => setEcDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Brief Description / Impact
                    </label>
                    <input
                      type="text"
                      value={ecDescription}
                      onChange={(e) => setEcDescription(e.target.value)}
                      placeholder="e.g. Led technical committee of 15 members; oversaw project evaluations."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowAddEc(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs"
                  >
                    Save Activity
                  </button>
                </div>
              </form>
            )}

            {/* Extracurriculars List */}
            {extracurriculars.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No extracurricular activities added yet.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Adding hackathons, club leadership, certifications, and technical projects significantly elevates your recruiter screening score.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddEc(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Entry</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {extracurriculars.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExtracurricular(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Progress</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeSection !== 'personal' && (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === 'extracurricular') setActiveSection('academic');
                  else if (activeSection === 'academic') setActiveSection('personal');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {activeSection !== 'extracurricular' ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save and Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteProfile}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
