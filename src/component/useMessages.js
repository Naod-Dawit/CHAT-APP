import { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebaseconfig";
import { collection, addDoc, orderBy, query, onSnapshot, getDocs } from "firebase/firestore";

const useMessages = (recipientId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsubscribe;
    };

    const fetchCurrentUserName = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentUser = usersList.find(user => user.userId === auth.currentUser?.uid);
      if (currentUser) {
        setCurrentUserName(currentUser.name);
      }
    };

    fetchMessages();
    fetchCurrentUserName();
  }, [recipientId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (newMessage) => {
    if (currentUser && newMessage.trim() !== "" && recipientId.trim() !== "") {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        timestamp: new Date(),
        senderId: currentUser.uid,
        recipientId:recipientId,
      });
    }
  };

  return { messages, sendMessage, currentUserName, messagesEndRef };
};

export default useMessages;
