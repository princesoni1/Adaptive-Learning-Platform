// src/LoginPage.js
import React, { useState } from "react";
import styled from "styled-components";
import { Flipper, Flipped } from "react-flip-toolkit";
import LoginContainer from "./LoginContainer";
import RegisterContainer from "./RegisterContainer";

const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftSide = styled.div`
  flex: 1;
  background-color: #96C9F4;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 100%;
  height: auto;
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('\image.png'); /* Path to your image */
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
        <Logo src="Logo.jpeg" alt="Logo" />
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
