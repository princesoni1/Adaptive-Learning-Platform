// src/LoginPage.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Flipper, Flipped } from "react-flip-toolkit";
import LoginContainer from "./LoginContainer";
import RegisterContainer from "./RegisterContainer";

// Gradient background animation (subtle change)
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Define the rotation animation using keyframes
const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftSide = styled.div`
  flex: 1;
  background: linear-gradient(-45deg, #96C9F4, #3793E0, #92D1FF, #5B8BF2);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 10s ease infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const LogoWrapper = styled.div`
  position: relative;
  text-align: center; /* Center both the logo and the tagline */
  width: 400px; /* Adjust the size of the logo */
  height: auto;
`;

const Logo = styled.img`
  width: 300px; /* Adjusted to make the logo fit better */
  height: auto;
  position: relative;
  z-index: 2; /* Places LogoName on top */
  display: block;
  margin: 0 auto;
`;

const RotatingLogo = styled.img`
  width: 220px;
  height: 220px;
  animation: ${rotateAnimation} 15s linear infinite; /* Adjusted rotation speed */
  position: absolute;
  top: 40px;
  left: calc(50% - 110px); /* Center the rotating cube relative to LogoWrapper */
  z-index: 1; /* Places CubeLogo behind LogoName */
  opacity: 0.3; /* Adjust transparency */
`;


const RightSide = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/image.png'); /* Path to your image */
  background-size: cover; /* Ensures the image covers the entire area */
  background-position: center; /* Centers the image */
  background-repeat: no-repeat; /* Prevents the image from repeating */
  position: relative;
`;

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  const handleFlip = () => setShowLogin(!showLogin);

  return (
    <PageWrapper>
      <LeftSide>
        <LogoWrapper>
          {/* Rotating CubeLogo image */}
          <RotatingLogo src="CubeLogo.png" alt="Rotating Cube Logo" />
          {/* Static LogoName image */}
          <Logo src="LogoName.png" alt="Adaptive Learning Logo" />
          {/* Tagline added below the logo */}
          {/* <Tagline>Personalized education for all</Tagline> */}
        </LogoWrapper>
      </LeftSide>

      <RightSide>
        <Flipper flipKey={showLogin}>
          <Flipped flipId="form">
            <div>
              {showLogin ? (
                <LoginContainer onFlip={handleFlip} />
              ) : (
                <RegisterContainer onFlip={handleFlip} />
              )}
            </div>
          </Flipped>
        </Flipper>
      </RightSide>
    </PageWrapper>
  );
};

export default LoginPage;
