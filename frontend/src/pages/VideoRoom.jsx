import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVideoAccess, endConsultationCall } from "../services/appointmentService";
import { getSocket } from "../services/chatService";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VideoRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Device controls
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Initializing media...");
  const [peersCount, setPeersCount] = useState(0);

  // Timers
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  // 1. Check Appointment Access & Eligibility
  useEffect(() => {
    let active = true;

    async function checkAccess() {
      setLoading(true);
      setError("");

      try {
        const res = await getVideoAccess(appointmentId);
        if (active) {
          setAppointment(res.appointment);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to join video consultation.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  // 2. Initialize Local Stream
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setConnectionStatus("Camera and microphone ready");
    } catch (err) {
      console.warn("Device media warning:", err.message);
      setConnectionStatus("Media permission denied or devices unavailable.");
    }
  }, []);

  useEffect(() => {
    if (!loading && !error && appointment) {
      initLocalStream();
    }

    return () => {
      // Clean up local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loading, error, appointment, initLocalStream]);

  // 3. WebRTC Setup & Socket Signaling when entering room
  const enterConsultation = () => {
    setInWaitingRoom(false);
    setConnectionStatus("Connecting to consultation room...");

    const socket = getSocket();
    if (!socket) {
      setError("Unable to connect to real-time communication server.");
      return;
    }
    socketRef.current = socket;

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          appointmentId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setConnectionStatus("Connected securely with peer");
      } else if (pc.iceConnectionState === "disconnected") {
        setConnectionStatus("Peer disconnected. Waiting to reconnect...");
      } else if (pc.iceConnectionState === "failed") {
        setConnectionStatus("Connection failed. Attempting reconnect...");
      }
    };

    // Join room on Socket.IO
    socket.emit("join_video_room", { appointmentId });

    socket.on("video_room_joined", async (data) => {
      setPeersCount(data.otherPeersCount);
      if (data.otherPeersCount > 0) {
        setConnectionStatus("Peer is in room. Establishing secure connection...");
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc_offer", { appointmentId, sdp: offer });
        } catch (e) {
          console.error("Offer creation error:", e);
        }
      } else {
        setConnectionStatus("Waiting for the other participant to join...");
      }
    });

    socket.on("peer_connected", async () => {
      setPeersCount((c) => c + 1);
      setConnectionStatus("Participant joined! Creating connection offer...");
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc_offer", { appointmentId, sdp: offer });
      } catch (e) {
        console.error("Offer creation error on peer connect:", e);
      }
    });

    socket.on("webrtc_offer", async (data) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { appointmentId, sdp: answer });
        setConnectionStatus("Connection answer sent. Media streaming...");
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    });

    socket.on("webrtc_answer", async (data) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setConnectionStatus("Connected with participant");
      } catch (e) {
        console.error("Error setting remote answer:", e);
      }
    });

    socket.on("webrtc_ice_candidate", async (data) => {
      try {
        if (data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (e) {
        console.error("Error adding candidate:", e);
      }
    });

    socket.on("video_call_ended", () => {
      handleCallEndCleanup(false);
    });
  };

  // Timer while inside active consultation
  useEffect(() => {
    let timer = null;
    if (!inWaitingRoom && !callEnded) {
      timer = setInterval(() => {
        setSecondsElapsed((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inWaitingRoom, callEnded]);

  // Toggle Mute / Camera
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  // Clean termination of call
  const handleCallEndCleanup = async (isInitiator = true) => {
    setCallEnded(true);

    if (socketRef.current) {
      if (isInitiator) {
        socketRef.current.emit("end_video_call", { appointmentId });
      }
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      await endConsultationCall(appointmentId);
    } catch (err) {
      console.warn("End call API notice:", err.message);
    }

    // Trigger review screen for client
    if (user?.role === "client") {
      setIsReviewOpen(true);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-slate-400">Verifying video consultation credentials...</p>
        </div>
      </main>
    );
  }

  if (error || !appointment) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-100">Consultation Unavailable</h2>
          <p className="mt-2 text-sm text-slate-400">{error || "Unable to join consultation."}</p>
          <button
            type="button"
            onClick={() => navigate(user?.role === "lawyer" ? "/lawyer-dashboard" : "/my-appointments")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const isClient = user?.role === "client";
  const partnerName = isClient
    ? appointment.lawyer?.user?.name || "Lawyer"
    : appointment.client?.name || "Client";

  // RENDER: Call Ended Screen
  if (callEnded && !isReviewOpen) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-100">Consultation Completed</h2>
          <p className="mt-2 text-sm text-slate-400">
            Duration: <span className="font-semibold text-slate-200">{formatTimer(secondsElapsed)}</span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {isClient && (
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-600 transition shadow-md"
              >
                Review Your Consultation
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(isClient ? "/my-appointments" : "/lawyer-dashboard")}
              className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>

        {isReviewOpen && (
          <ReviewModal
            appointment={appointment}
            isOpen={isReviewOpen}
            onClose={() => {
              setIsReviewOpen(false);
              navigate("/my-appointments");
            }}
            onReviewSubmitted={() => {
              setIsReviewOpen(false);
              navigate("/my-appointments");
            }}
          />
        )}
      </main>
    );
  }

  // RENDER: Pre-Meeting Waiting Room Screen
  if (inWaitingRoom) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
        {/* Top Header */}
        <header className="mx-auto w-full max-w-4xl flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white font-bold">
              LC
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Legal Consultation Room</h1>
              <p className="text-xs text-slate-400">Appointment #{appointment._id.substring(0, 8)}</p>
            </div>
          </div>
          <Link
            to={isClient ? "/my-appointments" : "/lawyer-dashboard"}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Room
          </Link>
        </header>

        {/* Center Preview */}
        <section className="mx-auto w-full max-w-4xl py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Camera Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover -scale-x-100 ${!cameraEnabled ? "hidden" : ""}`}
            />
            {!cameraEnabled && (
              <div className="flex flex-col items-center text-slate-500">
                <VideoOff className="h-12 w-12" />
                <p className="mt-2 text-xs">Camera is turned off</p>
              </div>
            )}

            {/* Quick Controls overlay on preview */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-3 rounded-full transition shadow-lg ${
                  micEnabled ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-600 text-white"
                }`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`p-3 rounded-full transition shadow-lg ${
                  cameraEnabled ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-600 text-white"
                }`}
                title={cameraEnabled ? "Turn Off Video" : "Turn On Video"}
              >
                {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Details & Join Action */}
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-700/50">
                Encrypted Peer Consultation
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-white">
                Ready to consult with {partnerName}?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Check your audio and video before entering. Your conversation is secure and private.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time</span>
                <span className="font-semibold text-slate-200">
                  {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-green-400 capitalize">{connectionStatus}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={enterConsultation}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-700/20 hover:from-blue-600 hover:to-indigo-500 transition"
            >
              Enter Video Consultation
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pb-2">
          LegalConnect Secure WebRTC Signaling • Zero recording without mutual authorization
        </footer>
      </main>
    );
  }

  // RENDER: Full Active Consultation Room
  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-white select-none">
      {/* Top Header Bar */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">
            LC
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{partnerName}</span>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Encrypted
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">{connectionStatus}</p>
          </div>
        </div>

        {/* Timer Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3.5 py-1.5 border border-slate-800 text-xs font-mono font-semibold text-slate-200">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </header>

      {/* Video Streams Container */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center">
        {/* Remote Video Stream (Center) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Remote Placeholder when waiting */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800/80 text-3xl font-bold text-slate-400 border border-slate-700/50">
            {partnerName.charAt(0)}
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-200">{partnerName}</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {peersCount > 0
              ? "Connecting remote peer stream..."
              : `Waiting for ${partnerName} to enter the video call...`}
          </p>
        </div>

        {/* Local Video Stream (Picture-in-Picture Corner) */}
        <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 aspect-video w-36 sm:w-56 overflow-hidden rounded-2xl bg-slate-950 border-2 border-slate-700/80 shadow-2xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover -scale-x-100 ${!cameraEnabled ? "hidden" : ""}`}
          />
          {!cameraEnabled && (
            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
              <VideoOff className="h-6 w-6" />
            </div>
          )}
          <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white/80 drop-shadow-md">
            You {!micEnabled && "(Muted)"}
          </span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-5 py-3 shadow-2xl backdrop-blur-md">
          {/* Toggle Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
              micEnabled
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/30"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Toggle Video */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
              cameraEnabled
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/30"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={() => handleCallEndCleanup(true)}
            className="flex h-12 items-center gap-2 rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700 transition shadow-lg shadow-red-600/40"
          >
            <PhoneOff className="h-5 w-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Review Modal Triggered After Call */}
      {isReviewOpen && (
        <ReviewModal
          appointment={appointment}
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            navigate("/my-appointments");
          }}
          onReviewSubmitted={() => {
            setIsReviewOpen(false);
            navigate("/my-appointments");
          }}
        />
      )}
    </main>
  );
}
