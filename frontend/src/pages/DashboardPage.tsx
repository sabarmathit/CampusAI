import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { StudentProfileOnboarding } from '../components/student/StudentProfileOnboarding';
import { FacultyDashboard } from '../components/dashboard/FacultyDashboard';
import { PlacementDashboard } from '../components/dashboard/PlacementDashboard';
import { RecruiterDashboard } from '../components/dashboard/RecruiterDashboard';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'student':
      if (!currentUser.profileCompleted) {
        return <StudentProfileOnboarding />;
      }
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'placement':
      return <PlacementDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    default:
      return <StudentDashboard />;
  }
};
