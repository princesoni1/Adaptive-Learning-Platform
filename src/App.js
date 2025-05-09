import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import Firebase auth
import LoginPage from "./LoginPage";
import AdminDashboard from './AdminDashboard';
import CourseDashboard from './CourseDashboard';
import VideoPage from './VideoPage';
import UserDetails from './UserDetails';

const ProtectedRoute = ({ user, roleCheck, children }) => {
    // Check if the user is logged in
    if (!user) {
        console.log('User Details Changed: User is not authenticated.');
        return <Navigate to="/login" />;
    }

    // Log user details
    console.log('User Details:', user);

    // Check if role check function is provided
    if (roleCheck) {
        const isRoleValid = roleCheck(user);
        console.log('User',user)
        console.log('Role Check:', isRoleValid ? 'User has the required role.' : 'User does not have the required role.');
        
        // If the role check fails, redirect to the home page
        if (!isRoleValid) {
            return <Navigate to="/" />;
        }
    } else {
        console.log('No role check function provided.');
    }

    return children;
};


const App = () => {
    const [user, setUser] = useState(null); // State to hold user info
    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log("User is logged in:", currentUser);
                setUser(currentUser); // Set user when logged in
            } else {
                console.log("No user is logged in.");
                setUser(null); // Set user to null if no one is logged in
            }
            setLoading(false); // Stop loading once Firebase finishes checking auth state
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show loading screen while checking auth state
    }

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes for admin */}
                <Route
                    path="/admindashboard"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleCheck={(user) => user.email === "r@gmail.com"} // Ensure only admin can access
                        >
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected routes for regular users */}
                <Route
                    path="/coursedashboard"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleCheck={(user) => user.email !== "r@gmail.com"} // Ensure non-admin can access
                        >
                            <CourseDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Common protected routes */}
                <Route
                    path="/videopage"
                    element={
                        <ProtectedRoute user={user}>
                            <VideoPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/userdetails"
                    element={
                        <ProtectedRoute user={user}>
                            <UserDetails />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
