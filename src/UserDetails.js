import React, { useState, useEffect } from 'react';
import './UserDetails.css';
import { db, auth } from './firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserDetails = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '', // Email will be set from auth
        mobile: '',
        languagePreference: '',
        learnerType: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); 
    // const [successMessage, setSuccessMessage] = useState(''); // To show success message
    const navigate = useNavigate(); // Get the navigate function

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser; 
            if (user) {
                const userId = user.uid;
                const docRef = doc(db, "users", userId);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            ...data,
                            email: user.email, // Set email from auth
                        });
                    } else {
                        setUserData((prevData) => ({
                            ...prevData,
                            email: user.email, // Set email if document does not exist
                        }));
                    }
                } catch (error) {
                    setError("Failed to fetch user data.");
                } finally {
                    setLoading(false); 
                }
            } else {
                setLoading(false); 
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setSuccessMessage(''); // Clear any previous success message
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const docRef = doc(db, "users", userId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    await updateDoc(docRef, userData); 
                    alert('User Details Updated Successfully')
                    // setSuccessMessage("User details updated successfully!");
                } else {
                    await setDoc(docRef, userData);
                    alert('User Details Created Successfully')
                    // setSuccessMessage("User details created successfully!");
                }
            } catch (error) {
                setError("Failed to save user data.");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);  // Sign out from Firebase
            localStorage.clear(); // Clear localStorage
            sessionStorage.clear(); // Clear sessionStorage (if you're using it)
            navigate('/login');   // Redirect to login page
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (loading) {
        return <p>Loading...</p>; 
    }

    return (
        <div className="container">
            <div className="sidebar">
                <div className="user-profile">
                    <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray" width="80px" height="80px">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <h2>{userData.name || 'User Name'}</h2>
                </div>
                <button className="sidebar-button">Edit Details</button>
                <button className="sidebar-button">Change Password</button>
                <button className="sidebar-button">Contact Support</button>
                <button className="sidebar-button logout" onClick={handleLogout}>Logout</button>
            </div>
            <div className="main-content">
                <h1>Edit Details:</h1>
                {error && <p className="error">{error}</p>} 
                {/* {successMessage && <p className="success">{successMessage}</p>} Display success message */}
                <form className="details-form" onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input 
                        type="text" 
                        value={userData.name} 
                        onChange={(e) => setUserData({...userData, name: e.target.value})} 
                        placeholder="Enter your name" 
                    />
                    
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={userData.email} 
                        readOnly // Making email read-only since it's fetched from auth
                    />
                    
                    <label>Contact Number:</label>
                    <input 
                        type="text" 
                        value={userData.mobile} 
                        onChange={(e) => setUserData({...userData, mobile: e.target.value})} 
                        placeholder="Enter your contact number" 
                    />
                    
                    <label>Language Preference:</label>
                    <select 
                        value={userData.languagePreference || ''} 
                        onChange={(e) => setUserData({...userData, languagePreference: e.target.value})}>
                        <option value="">Select Language</option>
                        <option value={userData.languagePreference}>{userData.languagePreference}</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                    </select>

                    <label>Learner Type:</label>
                    <select 
                        value={userData.learnerType || ''} 
                        onChange={(e) => setUserData({...userData, learnerType: e.target.value})}>
                        <option value="">Select Learner Type</option>
                        <option value={userData.learnerType}>{userData.learnerType}</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Average">Average</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <div className="form-buttons">
                        <button type="submit">Proceed</button>
                        <button type="button">Go Back</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetails;
