import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebaseconfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

const VideoCall = ({ recipientId, currentUser }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");

  useEffect(() => {
    if (!recipientId || !currentUser) return;

    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);

        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          remoteStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = remoteStream;
        };

        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            const roomRef = doc(collection(db, "rooms"), recipientId);
            await addDoc(
              collection(roomRef, "callerCandidates"),
              event.candidate.toJSON()
            );
          }
        };

        const roomRef = doc(collection(db, "rooms"), recipientId);
        const roomSnapshot = await getDoc(roomRef);

        if (roomSnapshot.exists()) {
          const data = roomSnapshot.data();
          if (data.offer) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(roomRef, {
              answer: { type: answer.type, sdp: answer.sdp },
            });

            const candidatesCollection = collection(
              roomRef,
              "calleeCandidates"
            );
            onSnapshot(candidatesCollection, (snapshot) => {
              snapshot.docChanges().forEach(async (change) => {
                if (change.type === "added") {
                  const candidate = new RTCIceCandidate(change.doc.data());
                  await pc.addIceCandidate(candidate);
                }
              });
            });

            setConnectionStatus("Connected");
          }
        } else {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await setDoc(roomRef, {
            offer: { type: offer.type, sdp: offer.sdp },
          });

          pc.onicecandidate = async (event) => {
            if (event.candidate) {
              await addDoc(
                collection(roomRef, "callerCandidates"),
                event.candidate.toJSON()
              );
            }
          };

          setConnectionStatus("Waiting for peer...");
        }
      } catch (error) {
        console.error("Error initializing call:", error);
        setConnectionStatus("Failed to initialize call.");
      }
    };

    init();

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recipientId, currentUser]);

  const hangUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    const roomRef = doc(collection(db, "rooms"), recipientId);
    const calleeCandidatesSnapshot = await getDocs(
      collection(roomRef, "calleeCandidates")
    );
    calleeCandidatesSnapshot.forEach(async (candidateDoc) => {
      await deleteDoc(candidateDoc.ref);
    });
    const callerCandidatesSnapshot = await getDocs(
      collection(roomRef, "callerCandidates")
    );
    callerCandidatesSnapshot.forEach(async (candidateDoc) => {
      await deleteDoc(candidateDoc.ref);
    });
    await deleteDoc(roomRef);
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted></video>
      <video ref={remoteVideoRef} autoPlay></video>
      <button onClick={hangUp}>Hang Up</button>
      <p>Status: {connectionStatus}</p>
    </div>
  );
};

export default VideoCall;
