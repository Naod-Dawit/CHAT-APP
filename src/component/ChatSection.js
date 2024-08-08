import React, { useState, useEffect } from "react";
import useMessages from "./useMessages";
import { uploadFile } from "./Uploadfiles";
import { auth, updateUserStatus } from "../firebaseconfig";
import "../styles/chats.css";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { renderFilePreview } from "./Uploadfiles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ChatSection = ({ recipientId, setRecipientId, currentUser, users }) => {
  const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);

  const { messages, sendMessage, currentUserName, messagesEndRef } =
    useMessages(recipientId, currentUser);

  const selectedMember = users.find((user) => user.userId === recipientId);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleSendfile = async () => {
    if (selectedFile) {
      try {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const filePath = `chat_files/${fileName}`;

        const fileURL = await uploadFile(selectedFile, filePath);
        console.log("File URL: ", fileURL);
        await sendMessage(fileURL);
        setSelectedFile(null);
        setShowAttachments(false);
      } catch (error) {
        console.error("Error sending file: ", error);
      }
    }
  };

  return (
    <div className="chat-section">
      <div className="messages-box">
        <h3 className="sender-name">{selectedMember?.name}</h3>
        {messages
          .filter(
            (message) =>
              (message.senderId === currentUser?.uid &&
                message.recipientId === recipientId) ||
              (message.senderId === recipientId &&
                message.recipientId === currentUser?.uid)
          )
          .map((message) => (
            <div
              key={message.id}
              className={`chat-bubble ${
                message.senderId === currentUser?.uid ? "me" : "other"
              }`}
            >
              {message.text && !message.text.startsWith("http") ? (
                <span>{message.text}</span>
              ) : message.text && message.text.startsWith("http") ? (
                renderFilePreview(message.text)
              ) : null}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input-box"
        />
        <div
          onClick={() => setShowAttachments(!showAttachments)}
          style={{ cursor: "pointer" }}
        >
          <FontAwesomeIcon icon="fa-solid fa-paperclip" fade />
        </div>
        <input
          id="attachments"
          type="file"
          style={{ display: showAttachments ? "block" : "none" }}
          onChange={handleFileChange}
        />
        <button
          className="chat-send-box"
          onClick={async () => {
            if (newMessage) {
              await sendMessage(newMessage);
              setNewMessage("");
            }
            handleSendfile();
          }}
        >
          <FontAwesomeIcon
            icon="fa-regular fa-paper-plane"
            bounce
            style={{ color: "#74C0FC" }}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
