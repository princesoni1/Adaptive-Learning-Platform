// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import Firebase auth
import LoginPage from "./LoginPage";
import AdminDashboard from './AdminDashboard';
import CourseDashboard from './CourseDashboard';
import VideoPage from './VideoPage';
import UserDetails from './UserDetails';

const App = () => {
    const [user, setUser] = useState(null); // State to hold user info

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update user state based on authentication status
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* Redirect to AdminDashboard if user is admin */}
                <Route 
                    path="/admindashboard" 
                    element={user && user.email === "r@gmail.com" ? <AdminDashboard /> : <Navigate to="/" />} 
                />
                {/* Redirect to CourseDashboard if user is a regular user */}
                <Route 
                    path="/coursedashboard" 
                    element={user && user.email !== "r@gmail.com" ? <CourseDashboard /> : <Navigate to="/" />} 
                />
                <Route path="/videopage" element={<VideoPage />} />
                <Route path="/userdetails" element={<UserDetails />} />
            </Routes>
        </Router>
    );
};

export default App;
