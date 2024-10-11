import React, { useState, useEffect } from 'react';
import './UserDetails.css';
import { db, auth } from './firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 

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

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser; 
            if (user) {
                const userId = user.uid;
                console.log("Current User ID:", userId); // Log the user ID
                const docRef = doc(db, "users", userId);
                console.log("Document Reference:", docRef.path); // Log the document reference
                try {
                    const docSnap = await getDoc(docRef);
                    console.log("Document snapshot:", docSnap);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Fetched User Data: ", data);
                        setUserData({
                            ...data,
                            email: user.email, // Set email from auth
                        });
                    } else {
                        console.log("No such document! User needs to fill in details.");
                        setUserData((prevData) => ({
                            ...prevData,
                            email: user.email, // Set email if document does not exist
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user data: ", error);
                    setError("Failed to fetch user data.");
                } finally {
                    setLoading(false); 
                }
            } else {
                console.log("No user is signed in");
                setLoading(false); 
            }
        };
    
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const docRef = doc(db, "users", userId);
            try {
                // Check if user data already exists in Firestore
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // If exists, update the document
                    await updateDoc(docRef, userData); 
                    alert("User details updated successfully!");
                } else {
                    // If does not exist, create a new document
                    await setDoc(docRef, userData);
                    alert("User details created successfully!");
                }
            } catch (error) {
                console.error("Error saving user data: ", error);
                setError("Failed to save user data.");
            }
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
                <button className="sidebar-button logout">Logout</button>
            </div>
            <div className="main-content">
                <h1>Edit Details:</h1>
                {error && <p className="error">{error}</p>} 
                <form className="details-form" onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input 
                        type="text" 
                        value={userData.name} 
                        onChange={(e) => setUserData({...userData, name: e.target.value})} 
                        placeholder="Display current name" 
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
                        value={userData.mobile} // Changed to match Firestore data
                        onChange={(e) => setUserData({...userData, mobile: e.target.value})} 
                        placeholder="Display current Contact Number" 
                    />
                    
                    <label>Language Preference:</label>
                    <select 
                        value={userData.languagePreference || ''} // Ensure it defaults to empty if undefined
                        onChange={(e) => setUserData({...userData, languagePreference: e.target.value})}>
                        <option value="">Select Language</option>
                        <option value={userData.languagePreference}>{userData.languagePreference}</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                    </select>

                    <label>Learner Type:</label>
                    <select 
                        value={userData.learnerType || ''} // Ensure it defaults to empty if undefined
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
