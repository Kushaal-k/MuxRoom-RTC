import { useEffect, useRef, useState } from "react";
import { socket } from "../config/socket";

export function useWebRTC(roomId?: string, username?: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const joinRoom = () => {
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

    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!))

    // const stream = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });

    // setLocalStream(stream);

    // if (videoRef.current) {
    //   videoRef.current.srcObject = stream;
    // }

    // stream.getTracks().forEach((track) => {
    //   pc.addTrack(track, stream);
    // });

    return pc;
  };

//   const createOffer = async () => {
//     if (!peers.current || !roomId) return;

//     socket.emit("join-room", roomId);

//     const offer = await peers.current   .createOffer();
//     await peers.current.setLocalDescription(offer);

//     socket.emit("offer", { roomId, sdp: offer });
//   };

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

  const endCall = async () => {
    peers.current.forEach(pc => pc.close());   
    peers.current.clear();
    localStream?.getTracks().forEach(t => t.stop());

    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams(new Map());
    if(videoRef.current) videoRef.current.srcObject = null;
    
    socket.emit("peer-left", { roomId });
  };

  useEffect(() => {
    socket.on("connect", () => setUserId(socket.id as string));
    return () => { socket.off("connect"); };
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(stream => {
        localStreamRef.current = stream;
        setLocalStream(stream);
        if(videoRef.current) videoRef.current.srcObject = stream;
    })
  }, []);

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
        // const pc = await createPeerConnection(socketId);
        // const offer = await pc.createOffer();
        // await pc.setLocalDescription(offer);
        // socket.emit("offer", { target: socketId, sdp: offer });

        await createPeerConnection(socketId);
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
    toggleMic,
    toggleCamera,
    endCall,
    joinRoom,
    isMicOn,
    isCameraOn,
  };
}