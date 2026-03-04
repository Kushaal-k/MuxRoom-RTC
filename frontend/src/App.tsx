import './App.css'
import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

function App() {
  const [roomId, setRoomId] = useState<string>("");
  const roomIdRef = useRef<string>("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pc = useRef<RTCPeerConnection | null>(null);

  const createOffer = async () => {
    if (!pc.current) return;

    socket.emit("join-room", roomId);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, sdp: offer })

  }

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  /** Creates a fresh RTCPeerConnection and re-acquires the camera/mic */
  const initConnection = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId: roomIdRef.current, candidate: event.candidate })
      }
    }

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }

    pc.current.onconnectionstatechange = () => {
      console.log("Connection State:", pc.current?.connectionState);
    };

    pc.current.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.current?.iceConnectionState);
    };
  };

  const endCall = () => {
    pc.current?.close();
    pc.current = null;

    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);

    if (videoRef.current) videoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Re-initialize so the user can make another call without refreshing
    initConnection();
  };

  useEffect(() => {
    initConnection();
  }, [])

  useEffect(() => {
    const handleOffer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("answer", { roomId: roomIdRef.current, sdp: answer });
    };

    const handleAnswer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);
    };

    const handleIceCandidate = async (data: any) => {
      if (!pc.current) return;

      await pc.current.addIceCandidate(data.candidate);
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    // Cleanup: remove listeners so React strict mode doesn't register duplicates
    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [])

  return (
    <div className="app">
      <div className="videos">
        <div className="video-box" id="local-video">
          <video ref={videoRef} autoPlay muted></video>
        </div>
        <div className="video-box" id="remote-video">
          <video ref={remoteVideoRef} autoPlay></video>
        </div>
      </div>
      <div className="controls">
        <input type="text" value={roomId} onChange={(e) => { setRoomId(e.target.value); roomIdRef.current = e.target.value; }} placeholder="Room ID" />
        <button id="btn-call" onClick={createOffer}>Call</button>
        <button id="btn-join" onClick={() => socket.emit("join-room", roomId)}>Join</button>
        <button id="btn-mic" onClick={toggleMic}>Toggle Mic</button>
        <button id="btn-camera" onClick={toggleCamera}>Toggle Camera</button>
        <button id="btn-hangup" onClick={endCall}>Hangup</button>
      </div>
    </div>
  )
}

export default App
