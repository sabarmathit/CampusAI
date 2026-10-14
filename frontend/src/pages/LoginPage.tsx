import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import {
  Layers,
  GraduationCap,
  UserCheck2,
  Building,
  Briefcase,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Building2,
  Award
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('sabarmathit@campus.edu');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Registration form state
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Role-specific fields
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regRollNo, setRegRollNo] = useState('21CS150');
  const [regCGPA, setRegCGPA] = useState(8.5);
  const [regGradYear, setRegGradYear] = useState(2026);
  const [regSkills, setRegSkills] = useState('React, TypeScript, Python');
  const [regDesignation, setRegDesignation] = useState('Assistant Professor');
  const [regSpecialization, setRegSpecialization] = useState('Distributed Computing');
  const [regCompany, setRegCompany] = useState('NexaTech Systems');
  const [regOffice, setRegOffice] = useState('Placement Block, Level 3');

  // Pre-configured Test Accounts
  const demoAccounts = [
    {
      role: 'student' as UserRole,
      title: 'Student Demo Account',
      name: 'Sabarmathi T',
      email: 'sabarmathit@campus.edu',
      password: 'password123',
      detail: 'CSE · Class of 2026 · CGPA 8.92',
      accentColor: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
      badgeColor: 'bg-blue-600 text-white',
      Icon: GraduationCap
    },
    {
      role: 'faculty' as UserRole,
      title: 'Faculty Demo Account',
      name: 'Dr. Sundar Rajan',
      email: 'sundar.rajan@campus.edu',
      password: 'password123',
      detail: 'Professor & Course Director · CSE',
      accentColor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
      badgeColor: 'bg-emerald-600 text-white',
      Icon: UserCheck2
    },
    {
      role: 'placement' as UserRole,
      title: 'Placement Cell Demo Account',
      name: 'Dr. Vikram Malhotra',
      email: 'placement.cell@campus.edu',
      password: 'password123',
      detail: 'Head, Training & Corporate Placement',
      accentColor: 'border-purple-200 hover:border-purple-400 bg-purple-50/50',
      badgeColor: 'bg-purple-600 text-white',
      Icon: Building
    },
    {
      role: 'recruiter' as UserRole,
      title: 'Recruiter Demo Account',
      name: 'Priya Menon',
      email: 'priya.menon@nexatech.io',
      password: 'password123',
      detail: 'Lead University Talent · NexaTech Systems',
      accentColor: 'border-amber-200 hover:border-amber-400 bg-amber-50/50',
      badgeColor: 'bg-amber-600 text-white',
      Icon: Briefcase
    }
  ];

  const handleQuickLogin = (email: string, pass: string, nameStr: string, r: UserRole) => {
    try {
      login(email, pass);
      showToast(`Welcome back, ${nameStr}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      const user = login(loginEmail.trim(), loginPassword.trim());
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    try {
      if (regRole === 'student') {
        const user = register({
          name: regName.trim(),
          email: regEmail.trim(),
          role: 'student',
          profileCompleted: false,
          skills: []
        }, regPassword);

        showToast(`Registration successful! Welcome, ${user.name}. Let's complete your profile.`, 'success');
        navigate('/dashboard');
        return;
      }

      const user = register({
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        department: regDept,
        designation: regDesignation,
        specialization: regRole === 'faculty' ? regSpecialization : undefined,
        companyName: regRole === 'recruiter' ? regCompany : undefined,
        officeLocation: regRole === 'placement' ? regOffice : undefined,
      }, regPassword);

      showToast(`Registration successful! Logged in as ${user.name} (${regRole.toUpperCase()})`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm mb-1">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Nexus Campus AI Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Multi-Agent AI Powered Campus Productivity, Academic, Internship and Placement Management System.
        </p>

        {currentUser && isAuthenticated && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 max-w-md mx-auto shadow-2xs">
            <span className="truncate pr-2">
              Active session: <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              Open Dashboard →
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl mt-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-6 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In to Portal
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register New Account
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* LOGIN TAB */}
        {activeTab === 'login' ? (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sabarmathit@campus.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sign In & Access Role Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Clearly Documented Test Accounts with 1-Click Launch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Documented Demo Accounts (1-Click Launch)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Password: password123</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map(demo => {
                  const Icon = demo.Icon;
                  return (
                    <div
                      key={demo.role}
                      onClick={() => handleQuickLogin(demo.email, demo.password, demo.name, demo.role)}
                      className={`p-4 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between group ${demo.accentColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${demo.badgeColor} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {demo.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{demo.email}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{demo.role} · {demo.detail}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION TAB */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['student', 'faculty', 'recruiter', 'placement'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegRole(r)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        regRole === r
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'placement' ? 'Placement Cell' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sabarmathi T"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@campus.edu"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              {regRole === 'student' ? (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-900">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Student Registration: Skills Handled via Resume</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    No manual skill entry is required during registration. Complete your profile in the next step to record academic information, and your technical competencies will be identified automatically from your uploaded resume.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    {regRole.toUpperCase()} Specification Details
                  </span>

                {regRole === 'faculty' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={regSpecialization}
                        onChange={(e) => setRegSpecialization(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {regRole === 'recruiter' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="e.g. NexaTech Systems"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        placeholder="e.g. Campus Talent Lead"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {regRole === 'placement' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        placeholder="e.g. Placement Officer"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Office Location
                      </label>
                      <input
                        type="text"
                        value={regOffice}
                        onChange={(e) => setRegOffice(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Complete Registration & Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          Nexus Multi-Agent Campus & Placement System · Secure Role-Based Prototype
        </div>
      </div>
    </div>
  );
};
