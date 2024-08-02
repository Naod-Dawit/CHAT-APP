import { initializeApp } from "firebase/app";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase, onDisconnect, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBt0lihPxXL0CEhbQucwkxj6Lf7ZIHymRU",
  authDomain: "my-chat-app-fa016.firebaseapp.com",
  projectId: "my-chat-app-fa016",
  storageBucket: "my-chat-app-fa016.appspot.com",
  messagingSenderId: "920264255928",
  appId: "1:920264255928:web:d6e35e300594b24ea0c74d",
  measurementId: "G-15Q89E16SF",
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


export const realTimeDb = getDatabase(app);
export const updateUserStatus = (userId, isOnline) => {
  const userStatusRef = ref(realTimeDb, `status/${userId}`);
  set(userStatusRef, {
    online: isOnline,
    last_changed: new Date().toISOString(),
  });

  onDisconnect(userStatusRef).set({
    online: false,
    last_changed: new Date().toISOString(),
  });
};


