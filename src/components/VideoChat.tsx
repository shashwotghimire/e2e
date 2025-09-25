import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { Button } from "./ui/button";
interface VideoChatProps {
  chatId: any;
}
function VideoChat({ chatId }: VideoChatProps) {
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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          chatId,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // connect to signalling server and join room
  useEffect(() => {
    socket.connect();
    socket.emit("join_chat", chatId);

    socket.on("offer", async (offer) => {
      const pc = pcRef.current ?? createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer)); //set remote description of the offer from peer
      const answer = await pc.createAnswer(); //create local answer
      await pc.setLocalDescription(answer); //pc.onicecandidate events will start firing after this

      socket.emit("answer", { chatId, answer });
    });

    socket.on("answer", async (answer) => {
      const pc = pcRef.current ?? createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.disconnect();
    };
  }, [chatId]);

  const startCall = async () => {
    const pc = pcRef.current ?? createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { chatId, offer });
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
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        style={{ transform: "scaleX(-1)" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ transform: "scaleX(-1)" }}
      />
      <div>
        <Button onClick={startLocal} className="cursor-pointer">
          Start Camera
        </Button>
        <Button onClick={startCall} className="cursor-pointer">
          Start Call
        </Button>
      </div>
    </div>
  );
}

export default VideoChat;
