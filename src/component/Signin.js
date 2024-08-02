import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, updateUserStatus } from "../firebaseconfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

import "../styles/login.css";
const Auth = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => console.log(doc.id, doc.data()));
    };
    fetchUserData();
  }, []);

  const handleInputs = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      
      updateUserStatus(user.uid, true);
      console.log(user);
      navigate('/userpage')
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Failed to sign in. Please check your email and password.");
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateUserStatus(user.uid, true);
        navigate('/userpage')
      }
    });

    return () => unSubscribe();
  }, [navigate]);

  return (
    <>
      <div className="signin">
        <h1>Welcome to login menu</h1>
        <div className="input-format">
          <input
            name="email"
            placeholder="Email"
            value={data.email}
            type="text"
            required
            onChange={handleInputs}
          />
          <input
            name="password"
            placeholder="Password"
            value={data.password}
            type="password"
            required
            onChange={handleInputs}
          />
        </div>

        <button className="button-create" onClick={() => navigate("/")}>
          JOIN NOW
        </button>
        <button className="button-signin" onClick={handleSignIn}>
          SIGN IN
        </button>
      </div>
    </>
  );
};

export default Auth;
