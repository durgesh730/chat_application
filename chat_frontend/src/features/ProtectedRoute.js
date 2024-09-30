import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideDrawer from '../component/ui/SideBarUI/SideBarUI';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, receiver } = useAuth();

    // Show a loading spinner while checking authentication status
    if (isAuthenticated === null) {
        return (
            <div className='text-center pt-64'>
                <CircularProgress size={30} color="secondary" />
            </div>
        );
    }

    // Redirect to login if the user is not authenticated
    if (!isAuthenticated) {
        return <Navigate to='/login' />;
    }

    // Check if the user has access to this route (using the receiver flag)
    const hasAccess = receiver;

    return (
        <div className='bg-[#F8F7FA] min-h-screen'>
            <Box sx={{ display: "flex" }} className="hide-scrollbar">
                <Box className="hidden md:block shadow-2xl bg-white">
                    <SideDrawer />
                </Box>
                <Box component="main" className='h-screen pl-2' sx={{ flexGrow: 1, overflow: "auto" }}>
                    {hasAccess ? (
                        children
                    ) : (
                        <div className="text-center pt-64">
                            <h2>Please select the person you want to chat with.</h2>
                        </div>
                    )}
                </Box>
            </Box>
        </div>
    );
};

export default ProtectedRoute;
