import React, { useEffect, useState } from "react";
import { db, auth, updateUserStatus, realTimeDb, storage } from "../firebaseconfig";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDownloadURL, uploadBytes, ref as storageRef } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import ChatSection from "./ChatSection";
import "../styles/chats.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newAvatar, setnewAvatar] = useState("");
  const [searchTarget, setSearchTarget] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCurrentUser(currentUser.uid);
        
      } else {
        navigate("/");
      }
    });


    return () => unsubscribeAuth();
  }, [navigate]);

  
  
  
  const fetchCurrentUser = async (userId) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const currentUserData = usersList.find((user) => user.userId === userId);
      if (currentUserData) {
        setCurrentUser(currentUserData);
        
      }
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      if (!isMounted) return;
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        usersList.forEach((user) => {
          const statusRef = ref(realTimeDb, `status/${user.userId}`);
          onValue(statusRef, (snapshot) => {
            const status = snapshot.val();
            user.online = status?.online || false;
            setUsers([...usersList]);
          });
        });
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    const fetchStatusPeriodically = () => {
      fetchStatus();
      setTimeout(fetchStatusPeriodically, 5000);
    };

    fetchStatusPeriodically();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = users
    .filter((u) => u.userId !== auth.currentUser?.uid)
    .filter((user) =>
      user.name.toLowerCase().includes(searchTarget.toLowerCase())
    );

  useEffect(() => {
    const handleUserStatus = () => {
      if (user) {
        updateUserStatus(user.uid, true);
      }
    };

    const handleUserLogout = () => {
      if (user) {
        updateUserStatus(user.uid, false);
      }
    };

    handleUserStatus();

    return () => handleUserLogout();
  }, [user]);

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await updateUserStatus(auth.currentUser.uid, false);
        alert("Logged out Successfully");
      }
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setnewAvatar(e.target.files[0]);
    }
  };

  const uploadAvatar = async (file) => {
    const storageReference = storageRef(storage, `avatars/${Date.now()}_${file.name}`);
    await uploadBytes(storageReference, file);
    return getDownloadURL(storageReference);
  };

  
  const handleAvatarUpload = async () => {
    try {
      const avatarURL = await uploadAvatar(newAvatar);
      const userDoc = doc(db, "users", currentUser.id);
      await updateDoc(userDoc, { avatar: avatarURL });
      setCurrentUser({ ...currentUser, avatar: avatarURL });
      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  return (
    <div className="chat-page">
      <div className="users-list">
        <label>CHATS </label>
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchTarget(e.target.value)}
        />
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`chats-box ${
              recipientId === user.userId ? "selected" : ""
            }`}
            onClick={() => setRecipientId(user.userId)}
          >
            <div className="avatar-container">
              {user.online && <div className="online-status-bubble"></div>}
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar" />
              ) : (
                <div className="avatar-placeholder">No Image</div>
              )}
            </div>
            <span className="user-name">{user.name}</span>
          </div>
        ))}
      </div>
      <div className="chat-section-container">
        {recipientId && (
          <ChatSection
            recipientId={recipientId}
            setRecipientId={setRecipientId}
            currentUser={user}
            users={users}
          />
        )}
      </div>

      <div className="current-user-info">
        <h1 style={{ textAlign: "center" }}>About Me</h1>
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt="Current User Avatar"
            className="avatar-me"
          />
        ) : (
          <div className="avatar-placeholder">No Avatar</div>
        )}
        <h1 style={{ textAlign: "center" }}>{currentUser?.name}</h1>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <button onClick={handleAvatarUpload}>Update Avatar</button>
      </div>

      <button className="sign-out-button" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
};

export default ChatPage;
