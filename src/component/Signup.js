import React, { useState } from "react";
import { auth, db, storage } from "../firebaseconfig"; // Add storage import
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage methods

import '../styles/signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
  });
  const [avatar, setAvatar] = useState(null);

  const handleInputs = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const uploadAvatar = async (file) => {
    const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      let avatarURL = "";
      if (avatar) {
        avatarURL = await uploadAvatar(avatar);
      }

      await addDoc(collection(db, "users"), {
        userId: user.uid,
        email: data.email,
        name: data.name,
        age: data.age,
        avatar: avatarURL, 
      });

      alert("Account created successfully");
      navigate('/userpage')
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="signup">
      <h1>Welcome to LinkUp</h1>
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
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={data.name}
          onChange={handleInputs}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={data.age}
          onChange={handleInputs}
        />
        <label>Profile picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>
      <button className='button-signin' onClick={() => navigate("/")}>SIGN IN</button>
      <button className="button-create" onClick={handleSignUp}>Create Account</button>
    </div>
  );
};

export default Signup;
