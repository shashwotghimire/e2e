import { useEffect, useRef, useState } from "react";

function VideoChat() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null); // localVideoRef gives direct access to <video> element
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null); // localStream stores MediaStream (recording devices) so we can track RTCPeerConnection
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [sharing, setSharing] = useState(false); // ui state button toggle

  //   fucntion that asks for MediaStream access to stream to Video element

  const startLocal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const pc = pcRef.current ?? createPeerConnection();
      stream?.getTracks().forEach((track) => pc.addTrack(track, stream));
      setSharing(true);
    } catch (e: any) {
      alert(e);
    }
  };

  const stopLocal = () => {
    if (!localStream) return;
    localStream.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setSharing(false);
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    pcRef.current = pc;
    return pc;
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div>
      VideoChat
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 320, height: 180, background: "#000" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        muted
        style={{ width: 320, height: 180, background: "#222" }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={sharing ? stopLocal : startLocal}>
          {sharing ? "Stop Camera" : "Start Camera"}
        </button>
      </div>
    </div>
  );
}

export default VideoChat;
