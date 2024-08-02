import React, { useState,lazy,Suspense } from "react";
import '../styles/Authpage.css'
const Signup =lazy(()=>import ('./Signup'))
const Signin =lazy(()=>import ('./Signin'))

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-toggle">
        <button 
          className={`toggle-button ${isSignUp ? 'active' : ''}`} 
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
        <button 
          className={`toggle-button ${!isSignUp ? 'active' : ''}`} 
          onClick={() => setIsSignUp(false) }
        >
          Sign In
        </button>
      </div>
      <div className="auth-form">
        <Suspense >

        {isSignUp ? <Signup /> : <Signin />}
        </Suspense>
      </div>
    </div>
  );
};

export default AuthPage;
