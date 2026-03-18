import { useEffect, useRef, useState } from "react";
import { socket } from "../config/socket";

export function useWebRTC(roomId?: string, username?: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const isScreenSharingRef = useRef(false);
  const [userId, setUserId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const joinRoom = async () => {
    await startLocalStream();
    if (!localStreamRef.current) {
      console.warn("Local stream not ready yet");
      return;
    }
    socket.emit("join-room", {roomId, username});
  } 

  const createPeerConnection = async (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peers.current.set(userId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit("ice-candidate", {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.set(userId, event.streams[0]);
        return newStreams;
      });
    };  

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      
      const videoTrack = isScreenSharingRef.current && screenStreamRef.current 
        ? screenStreamRef.current.getVideoTracks()[0] 
        : localStreamRef.current.getVideoTracks()[0];
      
      if (videoTrack) {
        pc.addTrack(videoTrack, isScreenSharingRef.current ? screenStreamRef.current! : localStreamRef.current!);
      }
    }

    return pc;
  };

  const toggleMic = () => {
    if (!localStream) return;

    const audio = localStream.getAudioTracks()[0];
    audio.enabled = !audio.enabled;

    setIsMicOn(audio.enabled);
  };

  const toggleCamera = () => {
    if (!localStream) return;

    const video = localStream.getVideoTracks()[0];
    video.enabled = !video.enabled;

    setIsCameraOn(video.enabled);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharingRef.current) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];

        // Replace track for all peers
        peers.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        isScreenSharingRef.current = true;
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error starting screen share:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      peers.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = localStreamRef.current;
      }
    }
    isScreenSharingRef.current = false;
    setIsScreenSharing(false);
  };

  const endCall = async () => {
    peers.current.forEach(pc => pc.close());   
    peers.current.clear();
    localStream?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());

    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setIsScreenSharing(false);
    setRemoteStreams(new Map());
    if(videoRef.current) videoRef.current.srcObject = null;
    
    socket.emit("peer-left", { roomId });
  };

  useEffect(() => {
    socket.on("connect", () => setUserId(socket.id as string));
    return () => { socket.off("connect"); };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      localStreamRef.current = stream;
      setLocalStream(stream);
      if(videoRef.current) videoRef.current.srcObject = stream;

    } catch (error) {
        console.error("Camera access denied", error);
    }
    
  }
    

  useEffect(() => {

    const handleOffer = async ({target, sdp}: {target: string, sdp: RTCSessionDescriptionInit}) => {
        let pc = peers.current.get(target);
        if (!pc) pc = await createPeerConnection(target);

        await pc.setRemoteDescription(sdp);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", { target, sdp: answer });
    };

    const handleAnswer = async ({target, sdp}: {target: string, sdp: RTCSessionDescriptionInit}) => {
        const pc = peers.current.get(target);
        if (!pc) return;

        await pc.setRemoteDescription(sdp);
    };

    const handleIce = async ({target, candidate}: {target: string, candidate: RTCIceCandidateInit}) => {
        const pc = peers.current.get(target);
        if (!pc) return;

        await pc.addIceCandidate(candidate);
    };

    const handleUserJoined = async ({socketId, username}: {socketId: string, username: string}) => {

        setUserNames(prev => {
          const map = new Map(prev);
          map.set(socketId, username);
          return map;
        })
        const pc = await createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, sdp: offer });

        // await createPeerConnection(socketId);
    }

    const handleUserLeft = ({socketId}: { socketId: string}) => {
        const pc = peers.current.get(socketId);

        pc?.close();
        peers.current.delete(socketId);

        setRemoteStreams(prev => {
            const map = new Map(prev);
            map.delete(socketId);
            return map;
        })
    }

    // When we join a room, the server tells us who is already there
    const handleExistingUsers = async (users: {socketId: string, username: string}[]) => {
        setUserNames(prev => {
          const map = new Map(prev);
          users.forEach(({socketId, username}) => map.set(socketId, username));
          return map;
        })
        for (const { socketId } of users) {
            const pc = await createPeerConnection(socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { target: socketId, sdp: offer });
        }
    }

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIce);
    socket.on("user-joined", handleUserJoined);
    socket.on("peer-left", handleUserLeft);
    socket.on("existing-users", handleExistingUsers);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
      socket.off("user-joined", handleUserJoined);
      socket.off("peer-left", handleUserLeft);
      socket.off("existing-users", handleExistingUsers);
    };
  }, []);

  return {
    videoRef,
    remoteStreams,
    userNames,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    isScreenSharing,
    endCall,
    joinRoom,
    isMicOn,
    isCameraOn,
  };
}