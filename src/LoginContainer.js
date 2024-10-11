import React, { useState } from "react";
import styled from "styled-components";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  margin-bottom: 10px;
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

const RegisterButton = styled(Button)`
  background-color: #f4f4f4;
  color: #003366;
  margin-top: 10px;
`;

const LoginContainer = ({ onFlip }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");

      if (user.email === "r@gmail.com") {
        alert("Admin login successful!");
        navigate('/admindashboard');
      } else {
        alert("Login successful!");
        navigate('/coursedashboard');
      }
    } catch (error) {
      alert("Failed to login. Please check your credentials.");
    }
  };

  return (
    <Container>
      <Title>Login</Title>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin}>Login</Button>
      <RegisterButton onClick={onFlip}>Register</RegisterButton>
    </Container>
  );
};

export default LoginContainer;
