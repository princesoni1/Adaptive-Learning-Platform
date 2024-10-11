import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Flipper, Flipped } from "react-flip-toolkit";
import LoginContainer from "./LoginContainer";
import RegisterContainer from "./RegisterContainer";

// Gradient animation for background
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Rotation animation for rotating logo
const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
`;

const LogoWrapper = styled.div`
  text-align: center;
  width: 400px;
`;

const Logo = styled.img`
  width: 300px;
  position: relative;
  z-index: 2;
`;

const RotatingLogo = styled.img`
  width: 220px;
  animation: ${rotateAnimation} 15s linear infinite;
  position: absolute;
  top: 40px;
  left: calc(50% - 110px);
  z-index: 1;
  opacity: 0.5;
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('/image.png') center / cover no-repeat;
`;

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true);
  const toggleForm = () => setShowLogin(!showLogin);

  return (
    <PageWrapper>
      <LeftSide>
        <LogoWrapper>
          <RotatingLogo src="CubeLogo.png" alt="Rotating Cube Logo" />
          <Logo src="LogoName.png" alt="Adaptive Learning Logo" />
        </LogoWrapper>
      </LeftSide>

      <RightSide>
        <Flipper flipKey={showLogin}>
          <Flipped flipId="form">
            <div>
              {showLogin ? (
                <LoginContainer onFlip={toggleForm} />
              ) : (
                <RegisterContainer onFlip={toggleForm} />
              )}
            </div>
          </Flipped>
        </Flipper>
      </RightSide>
    </PageWrapper>
  );
};

export default LoginPage;
