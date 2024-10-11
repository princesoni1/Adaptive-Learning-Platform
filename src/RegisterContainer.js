// src/RegisterContainer.js
import React, { useState } from "react";
import styled from "styled-components";
import { db, auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 

const Container = styled.div`
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px -10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #003366;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const BackButton = styled(Button)`
  background-color: #f4f4f4;
  color: #003366;
  margin-top: 10px;
`;

const RegisterContainer = ({ onFlip }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    learnerType: "average",
    languagePreference: "english",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    const { name, email, password, mobile, learnerType, languagePreference } = formData;

    try {
        // Register user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid; // Get the user's UID

        // Store additional user data in Firestore using the UID as the document ID
        await setDoc(doc(db, "users", uid), { // Set the document ID to the user's UID
            uid, // Optional, since it's already in the document ID
            name,
            email,
            mobile,
            learnerType,
            languagePreference,
            createdAt: new Date(),
        });

        alert("Registration successful!");

        // Optionally redirect or flip back to login
        onFlip();
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Failed to register. Please try again.");
    }
};

  return (
    <Container>
      <Title>Register</Title>
      <Input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
      <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
      <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
      <Input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleInputChange} />
      <Select name="learnerType" value={formData.learnerType} onChange={handleInputChange}>
        <option value="Slow">Slow Learner</option>
        <option value="Average">Average Learner</option>
        <option value="Fast">Fast Learner</option>
      </Select>
      <Select name="languagePreference" value={formData.languagePreference} onChange={handleInputChange}>
        <option value="English">English</option>
        <option value="Hindi">Hindi</option>
      </Select>
      <Button onClick={handleRegister}>Register</Button>
      <BackButton onClick={onFlip}>Back to Login</BackButton>
    </Container>
  );
};

export default RegisterContainer;