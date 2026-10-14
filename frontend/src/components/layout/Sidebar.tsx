import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  FileCheck2,
  FolderGit2,
  Calendar,
  Sparkles,
  UserCircle,
  Users,
  ClipboardList,
  UserCheck,
  Building2,
  BarChart3,
  Video,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role;

  const handleLogout = () => {
    logout();
    showToast('Signed out of session successfully.', 'info');
    navigate('/login');
  };

  // Role accent highlights
  const roleAccentBg = {
    student: 'bg-blue-600',
    faculty: 'bg-emerald-600',
    placement: 'bg-purple-600',
    recruiter: 'bg-amber-600',
  }[role];

  const roleTextAccent = {
    student: 'text-blue-600',
    faculty: 'text-emerald-600',
    placement: 'text-purple-600',
    recruiter: 'text-amber-600',
  }[role];

  const roleBadgeBorder = {
    student: 'border-blue-200 bg-blue-50 text-blue-700',
    faculty: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    placement: 'border-purple-200 bg-purple-50 text-purple-700',
    recruiter: 'border-amber-200 bg-amber-50 text-amber-700',
  }[role];

  // Specific role navigation configuration per requirements
  const getNavLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/academics', label: 'Academics', icon: GraduationCap },
          { to: '/resume-skills', label: 'Resume & Skills', icon: FileText },
          { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
          { to: '/applications', label: 'My Applications', icon: FileCheck2 },
          { to: '/interviews', label: 'Interview Progress', icon: Video },
          { to: '/projects', label: 'My Projects', icon: FolderGit2 },
          { to: '/calendar', label: 'Calendar', icon: Calendar },
          { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      case 'faculty':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/faculty/students', label: 'My Students', icon: Users },
          { to: '/assignments', label: 'Assignments & Attendance', icon: ClipboardList },
          { to: '/projects', label: 'Projects', icon: FolderGit2 },
          { to: '/calendar', label: 'Calendar', icon: Calendar },
          { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      case 'placement':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/placement/students', label: 'Students', icon: Users },
          { to: '/placement/companies', label: 'Companies', icon: Building2 },
          { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
          { to: '/applications', label: 'Applications', icon: FileCheck2 },
          { to: '/interviews', label: 'Interviews', icon: Video },
          { to: '/reports', label: 'Reports', icon: BarChart3 },
          { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
        ];
      case 'recruiter':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/recruiter/jobs', label: 'My Job Posts', icon: Briefcase },
          { to: '/applicants', label: 'Applications', icon: Users },
          { to: '/interviews', label: 'Interviews', icon: Video },
          { to: '/company-profile', label: 'Company Profile', icon: Building2 },
          { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const roleDisplayNames = {
    student: 'Student Portal',
    faculty: 'Faculty Portal',
    placement: 'Placement Cell',
    recruiter: 'Recruiter Console',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col ${
          collapsed ? 'w-18' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-xs ${roleAccentBg}`}>
              <Layers className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-sm font-bold tracking-tight text-slate-900 block truncate">
                  Nexus Campus AI
                </span>
                <span className={`text-[10px] uppercase font-semibold tracking-wider block ${roleTextAccent}`}>
                  {roleDisplayNames[role]}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card Pill when expanded */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${roleBadgeBorder}`}>
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 text-slate-800">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold truncate leading-tight text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] opacity-80 truncate leading-tight capitalize">
                  {role === 'placement' ? 'Placement Officer' : role}
                  {currentUser.department ? ` · ${currentUser.department.split(' ')[0]}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 py-3 px-3 overflow-y-auto space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? `${roleAccentBg} text-white shadow-xs`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer with Sign Out */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign Out of Session"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {!collapsed ? (
            <div className="text-[11px] text-slate-400 text-center">
              <span>Final Year Capstone</span>
              <span className="mx-1.5">·</span>
              <span className="font-mono">v1.0</span>
            </div>
          ) : (
            <div className="text-center font-mono text-[10px] text-slate-400">
              v1.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
