import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  RotateCcw,
  Check,
  UserCheck2,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Users,
  Building,
  LogOut
} from 'lucide-react';

interface TopNavProps {
  onMenuClick: () => void;
  collapsed: boolean;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onMenuClick,
  collapsed,
  globalSearch,
  setGlobalSearch
}) => {
  const { currentUser, switchRole, allUsers, switchUser, resetDemoData, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  // Compute breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const formatBreadcrumb = (part: string) => {
    return part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setRoleSwitcherOpen(false);
    showToast(`Switched active persona to ${role.toUpperCase()}`, 'info');
    navigate('/dashboard');
  };

  const handleResetData = () => {
    resetDemoData();
    showToast('Mock data reset to initial project demo state', 'success');
    setProfileOpen(false);
  };

  const roleThemeBadge = {
    student: 'bg-blue-50 text-blue-700 border-blue-200',
    faculty: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    placement: 'bg-purple-50 text-purple-700 border-purple-200',
    recruiter: 'bg-amber-50 text-amber-700 border-amber-200',
  }[currentUser.role];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <Link 
            to="/dashboard" 
            className="text-slate-400 hover:text-slate-700 transition-colors font-medium"
          >
            Campus
          </Link>
          {pathParts.length > 0 && (
            <>
              <span className="text-slate-300">/</span>
              {pathParts.map((part, index) => {
                const isLast = index === pathParts.length - 1;
                const url = '/' + pathParts.slice(0, index + 1).join('/');
                return (
                  <React.Fragment key={url}>
                    {index > 0 && <span className="text-slate-300">/</span>}
                    {isLast ? (
                      <span className="text-slate-900 font-semibold truncate max-w-40 sm:max-w-xs">
                        {formatBreadcrumb(part)}
                      </span>
                    ) : (
                      <Link 
                        to={url} 
                        className="text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {formatBreadcrumb(part)}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search assignments, applicants, jobs, subjects..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right side: Role Switcher Quick Pill + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill for Demo Review */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:shadow-2xs ${roleThemeBadge}`}
          >
            <span className="capitalize">{currentUser.role === 'placement' ? 'Placement Cell' : currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in duration-100">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Switch Persona Demo</p>
              </div>

              <button
                onClick={() => handleRoleChange('student')}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                  currentUser.role === 'student' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student (Sabarmathi T)</span>
                </div>
                {currentUser.role === 'student' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleRoleChange('faculty')}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                  currentUser.role === 'faculty' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Faculty (Dr. Sundar)</span>
                </div>
                {currentUser.role === 'faculty' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleRoleChange('placement')}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                  currentUser.role === 'placement' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>Placement Cell (Dr. Vikram)</span>
                </div>
                {currentUser.role === 'placement' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleRoleChange('recruiter')}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                  currentUser.role === 'recruiter' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>Recruiter (Priya Menon)</span>
                </div>
                {currentUser.role === 'recruiter' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon with Unread Count */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs font-mono">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet for this account.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link) {
                          setNotifOpen(false);
                          navigate(notif.link);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                        !notif.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {notif.message}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.link && (
                          <span className="text-blue-600 flex items-center gap-0.5">
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="font-semibold text-slate-800 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 capitalize block leading-tight">{currentUser.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="capitalize font-semibold text-slate-700">{currentUser.role}</span>
                  {currentUser.cgpa && <span>· CGPA {currentUser.cgpa.toFixed(2)}</span>}
                </div>
              </div>

              {/* Specific user selection */}
              <div className="px-2 py-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400 px-1 mb-1">Switch Specific User</p>
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setProfileOpen(false);
                        showToast(`Switched user to ${u.name} (${u.role})`, 'info');
                        navigate('/dashboard');
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between ${
                        u.id === currentUser.id ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{u.name} ({u.role})</span>
                      {u.id === currentUser.id && <Check className="w-3 h-3 text-slate-700 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleResetData}
                  className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                    showToast('Logged out of campus session.', 'info');
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
