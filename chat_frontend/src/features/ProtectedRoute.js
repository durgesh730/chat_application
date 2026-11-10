import React from 'react';
import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideDrawer from '../component/ui/SideBarUI/SideBarUI';
import EmptyChatState from '../component/ui/EmptyChatState';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, receiver } = useAuth();

  // Show a modern loading spinner while checking authentication status
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <CircularProgress size={36} sx={{ color: '#6366f1' }} />
        <span className="text-sm font-medium text-gray-500 mt-4">Connecting...</span>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex">
      {/* Sidebar: always visible on desktop (md:flex), hidden on mobile when chat is active */}
      <aside
        className={`h-full shrink-0 ${
          receiver ? 'hidden md:flex' : 'flex w-full md:w-auto'
        }`}
      >
        <SideDrawer />
      </aside>

      {/* Main chat or empty state container */}
      <main
        className={`h-full flex-1 min-w-0 overflow-hidden ${
          !receiver ? 'hidden md:flex' : 'flex flex-col'
        }`}
      >
        {receiver ? children : <EmptyChatState />}
      </main>
    </div>
  );
};

export default ProtectedRoute;
