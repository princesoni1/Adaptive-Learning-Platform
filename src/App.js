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

    useEffect(() => {
        console.log("User state updated:", user);
    }, [user]);

    if (loading) {
        return <div>Loading...</div>; // Show loading screen while checking auth state
    }

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
