import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleRouteGuard } from './components/auth/RoleRouteGuard';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { ResumeSkillsPage } from './pages/ResumeSkillsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { FacultyStudentsPage } from './pages/FacultyStudentsPage';
import { RecruiterApplicantsPage } from './pages/RecruiterApplicantsPage';
import { RecruiterInterviewsPage } from './pages/RecruiterInterviewsPage';
import { PlacementCompaniesPage } from './pages/PlacementCompaniesPage';
import { StudentProfileOnboarding } from './components/student/StudentProfileOnboarding';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              {/* Login / Registration Screen */}
              <Route path="/login" element={<LoginPage />} />

              {/* Authenticated Application Layout */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Unified Role Dashboard */}
                <Route
                  path="dashboard"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty', 'placement', 'recruiter']}>
                      <DashboardPage />
                    </RoleRouteGuard>
                  }
                />
                
                {/* Academic Workflows - Student & Faculty */}
                <Route
                  path="academics"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty']}>
                      <AcademicsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="assignments"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty']}>
                      <AcademicsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty']}>
                      <AcademicsPage />
                    </RoleRouteGuard>
                  }
                />

                {/* Resume Intelligence & Skill Gap - Student Portal Only */}
                <Route
                  path="resume-skills"
                  element={
                    <RoleRouteGuard allowedRoles={['student']}>
                      <ResumeSkillsPage />
                    </RoleRouteGuard>
                  }
                />

                {/* Placement & Recruitment Workflows */}
                <Route
                  path="opportunities"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'placement', 'recruiter']}>
                      <OpportunitiesPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="applications"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'placement']}>
                      <ApplicationsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="interviews"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'placement', 'recruiter']}>
                      <RecruiterInterviewsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="onboarding"
                  element={
                    <RoleRouteGuard allowedRoles={['student']}>
                      <StudentProfileOnboarding />
                    </RoleRouteGuard>
                  }
                />

                {/* Recruiter-Specific Modules */}
                <Route
                  path="recruiter/jobs"
                  element={
                    <RoleRouteGuard allowedRoles={['recruiter']}>
                      <OpportunitiesPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="applicants"
                  element={
                    <RoleRouteGuard allowedRoles={['recruiter']}>
                      <RecruiterApplicantsPage />
                    </RoleRouteGuard>
                  }
                />
                
                {/* Placement Cell Administration */}
                <Route
                  path="placement/students"
                  element={
                    <RoleRouteGuard allowedRoles={['placement']}>
                      <FacultyStudentsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="placement/companies"
                  element={
                    <RoleRouteGuard allowedRoles={['placement']}>
                      <PlacementCompaniesPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <RoleRouteGuard allowedRoles={['placement']}>
                      <ReportsPage />
                    </RoleRouteGuard>
                  }
                />

                {/* Faculty Specific */}
                <Route
                  path="faculty/students"
                  element={
                    <RoleRouteGuard allowedRoles={['faculty']}>
                      <FacultyStudentsPage />
                    </RoleRouteGuard>
                  }
                />

                {/* Multi-Role Collaborative Modules */}
                <Route
                  path="projects"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty']}>
                      <ProjectsPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty', 'placement', 'recruiter']}>
                      <CalendarPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="ai-assistant"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty', 'placement', 'recruiter']}>
                      <AIAssistantPage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <RoleRouteGuard allowedRoles={['student', 'faculty', 'placement', 'recruiter']}>
                      <ProfilePage />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="company-profile"
                  element={
                    <RoleRouteGuard allowedRoles={['recruiter']}>
                      <ProfilePage />
                    </RoleRouteGuard>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
