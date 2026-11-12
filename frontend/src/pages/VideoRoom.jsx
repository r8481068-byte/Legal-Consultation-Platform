import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getVideoAccess,
  endConsultationCall,
} from "../services/appointmentService";
import { getSocket } from "../services/chatService";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const getIceUfrags = (sdp = "") => {
  return new Set(
    sdp
      .split(/\r?\n/)
      .filter((line) => line.startsWith("a=ice-ufrag:"))
      .map((line) => line.substring("a=ice-ufrag:".length).trim())
      .filter(Boolean),
  );
};

const getCandidateUfrag = (candidate) => {
  if (!candidate) return null;

  if (candidate.usernameFragment) {
    return candidate.usernameFragment;
  }

  const match = candidate.candidate?.match(/ufrag\s+([^\s]+)/);
  return match?.[1] || null;
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

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState(
    "Initializing media...",
  );
  const [peersCount, setPeersCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const makingOfferRef = useRef(false);
  const negotiationPendingRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isSettingRemoteAnswerPendingRef = useRef(false);

  const iceCandidateQueueRef = useRef([]);
  const ignoredIceUfragsRef = useRef(new Set());

  const handlersRef = useRef({});
  const mediaInitializedRef = useRef(false);
  const enteringRef = useRef(false);
  const isTerminatedRef = useRef(false);
  const joinedRoomRef = useRef(false);
  const appointmentIdRef = useRef(appointmentId);

  const isClient =
    user?.role === "client" ||
    user?.id === appointment?.client ||
    user?._id === appointment?.client;

  const isPolite = isClient;

  // ==========================================
  // 1. CHECK APPOINTMENT ACCESS
  // ==========================================

  useEffect(() => {
    let active = true;

    setAppointment(null);
    setLoading(true);
    setError("");

    setInWaitingRoom(true);
    setCallEnded(false);
    setIsReviewOpen(false);
    setSecondsElapsed(0);
    setPeersCount(0);
    setMediaReady(false);
    setMediaError("");
    setConnectionStatus("Initializing media...");

    isTerminatedRef.current = false;
    enteringRef.current = false;
    appointmentIdRef.current = appointmentId;

    async function checkAccess() {
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
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  // ==========================================
  // 2. LOCAL MEDIA INITIALIZATION
  // ==========================================

  useEffect(() => {
    let cancelled = false;
    let acquiredStream = null;

    async function initializeMedia() {
      if (loading || error || !appointment) return;

      mediaInitializedRef.current = true;
      setMediaReady(false);
      setMediaError("");
      setConnectionStatus("Requesting camera and microphone...");

      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError(
          "Camera and microphone are not supported by this browser or connection.",
        );
        setConnectionStatus("Media devices unavailable");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        acquiredStream = stream;

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        setMicEnabled(stream.getAudioTracks().some((track) => track.enabled));
        setCameraEnabled(
          stream.getVideoTracks().some((track) => track.enabled),
        );

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setMediaReady(true);
        setConnectionStatus("Camera and microphone ready");
      } catch (err) {
        if (cancelled) return;

        console.warn("Media access error:", err);

        setMediaReady(false);
        setMediaError(
          err.name === "NotAllowedError"
            ? "Camera/microphone permission denied. Please allow access in your browser."
            : err.name === "NotFoundError"
              ? "Camera or microphone not found. Please connect your devices."
              : "Unable to access camera and microphone. Please check your devices.",
        );

        setConnectionStatus("Media permission or device error");
      }
    }

    mediaInitializedRef.current = false;
    initializeMedia();

    return () => {
      cancelled = true;

      if (acquiredStream) {
        acquiredStream.getTracks().forEach((track) => track.stop());
      }

      if (localStreamRef.current === acquiredStream) {
        localStreamRef.current = null;
      }

      mediaInitializedRef.current = false;
    };
  }, [appointmentId, loading, error, appointment]);

  // ==========================================
  // 3. ICE CANDIDATE MANAGEMENT
  // ==========================================

  const drainIceCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;

    if (!pc?.remoteDescription) return;

    const remoteUfrags = getIceUfrags(pc.remoteDescription.sdp || "");

    const queued = iceCandidateQueueRef.current;
    iceCandidateQueueRef.current = [];

    for (const candidate of queued) {
      const candidateUfrag = getCandidateUfrag(candidate);

      if (candidateUfrag && ignoredIceUfragsRef.current.has(candidateUfrag)) {
        continue;
      }

      if (
        candidateUfrag &&
        remoteUfrags.size > 0 &&
        !remoteUfrags.has(candidateUfrag)
      ) {
        continue;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!ignoreOfferRef.current) {
          console.warn("Unable to add queued ICE candidate:", err);
        }
      }
    }
  }, []);

  // ==========================================
  // 4. WEBRTC CLEANUP
  // ==========================================

  const cleanupWebRtc = useCallback(() => {
    const socket = socketRef.current;
    const handlers = handlersRef.current;

    if (socket && handlers) {
      if (joinedRoomRef.current) {
        socket.emit("leave_video_room", {
          appointmentId: appointmentIdRef.current,
        });
      }

      if (handlers.handleVideoRoomJoined) {
        socket.off("video_room_joined", handlers.handleVideoRoomJoined);
      }

      if (handlers.handlePeerConnected) {
        socket.off("peer_connected", handlers.handlePeerConnected);
      }

      if (handlers.handlePeerDisconnected) {
        socket.off("peer_disconnected", handlers.handlePeerDisconnected);
      }

      if (handlers.handleWebRtcOffer) {
        socket.off("webrtc_offer", handlers.handleWebRtcOffer);
      }

      if (handlers.handleWebRtcAnswer) {
        socket.off("webrtc_answer", handlers.handleWebRtcAnswer);
      }

      if (handlers.handleIceCandidate) {
        socket.off("webrtc_ice_candidate", handlers.handleIceCandidate);
      }

      if (handlers.handleVideoCallEnded) {
        socket.off("video_call_ended", handlers.handleVideoCallEnded);
      }

      if (handlers.handleSocketReconnect) {
        socket.off("connect", handlers.handleSocketReconnect);
      }
    }

    handlersRef.current = {};
    joinedRoomRef.current = false;

    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;

      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.onnegotiationneeded = null;
      pc.onconnectionstatechange = null;

      pc.close();
      peerConnectionRef.current = null;
    }

    iceCandidateQueueRef.current = [];
    ignoredIceUfragsRef.current.clear();

    makingOfferRef.current = false;
    negotiationPendingRef.current = false;
    ignoreOfferRef.current = false;
    isSettingRemoteAnswerPendingRef.current = false;
    enteringRef.current = false;
  }, []);

  // ==========================================
  // 5. UNMOUNT CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      cleanupWebRtc();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [cleanupWebRtc]);

  // ==========================================
  // 6. WEBRTC NEGOTIATION
  // ==========================================

  const negotiate = useCallback(async () => {
    const pc = peerConnectionRef.current;
    const socket = socketRef.current;

    if (!pc || !socket || pc.signalingState === "closed") {
      return;
    }

    if (makingOfferRef.current) {
      negotiationPendingRef.current = true;
      return;
    }

    if (pc.signalingState !== "stable") {
      negotiationPendingRef.current = true;
      return;
    }

    makingOfferRef.current = true;
    negotiationPendingRef.current = false;

    try {
      const offer = await pc.createOffer();

      if (peerConnectionRef.current !== pc || pc.signalingState !== "stable") {
        negotiationPendingRef.current = true;
        return;
      }

      await pc.setLocalDescription(offer);

      if (peerConnectionRef.current !== pc) return;

      socket.emit("webrtc_offer", {
        appointmentId: appointmentIdRef.current,
        sdp: pc.localDescription,
      });
    } catch (err) {
      console.error("WebRTC negotiation error:", err);
      setConnectionStatus("Negotiation failed. Retrying...");
    } finally {
      makingOfferRef.current = false;

      if (
        negotiationPendingRef.current &&
        peerConnectionRef.current === pc &&
        pc.signalingState === "stable"
      ) {
        negotiationPendingRef.current = false;

        queueMicrotask(() => {
          negotiate();
        });
      }
    }
  }, []);

  // ==========================================
  // 7. ENTER CONSULTATION
  // ==========================================

  const enterConsultation = async () => {
    if (enteringRef.current || isTerminatedRef.current) return;

    if (!mediaReady || !localStreamRef.current) {
      setConnectionStatus(
        mediaError || "Please wait until camera and microphone are ready.",
      );
      return;
    }

    enteringRef.current = true;

    const stream = localStreamRef.current;

    if (!stream.getTracks().some((track) => track.readyState === "live")) {
      enteringRef.current = false;
      setConnectionStatus("Camera or microphone is no longer available.");
      return;
    }

    cleanupWebRtc();

    // cleanupWebRtc resets enteringRef, so set it again.
    enteringRef.current = true;

    const socket = getSocket();

    if (!socket) {
      enteringRef.current = false;
      setError("Unable to connect to real-time communication server.");
      return;
    }

    socketRef.current = socket;

    if (!socket.connected) {
      setConnectionStatus("Connecting to signaling server...");
      socket.connect();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Remote media
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams?.[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Local ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket.connected) {
        socket.emit("webrtc_ice_candidate", {
          appointmentId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (peerConnectionRef.current !== pc) return;

      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        setConnectionStatus("Connected securely with peer");
      } else if (pc.iceConnectionState === "disconnected") {
        setConnectionStatus("Peer disconnected. Waiting to reconnect...");
      } else if (pc.iceConnectionState === "failed") {
        setConnectionStatus("Connection failed. Please check your network.");
      }
    };

    pc.onconnectionstatechange = () => {
      if (peerConnectionRef.current !== pc) return;

      if (pc.connectionState === "failed") {
        setConnectionStatus("Connection failed.");
      }
    };

    pc.onnegotiationneeded = () => {
      negotiate();
    };

    // ==========================================
    // INCOMING ROOM EVENTS
    // ==========================================

    const handleVideoRoomJoined = async (data) => {
      joinedRoomRef.current = true;

      setPeersCount(data.otherPeersCount || 0);

      if (data.otherPeersCount > 0) {
        setConnectionStatus(
          "Peer is in room. Establishing secure connection...",
        );

        await negotiate();
      } else {
        setConnectionStatus("Waiting for the other participant to join...");
      }
    };

    const handlePeerConnected = async () => {
      setPeersCount((count) => Math.max(count, 1));

      setConnectionStatus(
        "Participant joined! Establishing secure connection...",
      );

      await negotiate();
    };

    const handlePeerDisconnected = () => {
      setPeersCount(0);
      setConnectionStatus("Participant disconnected. Waiting to reconnect...");
    };

    // ==========================================
    // INCOMING WEBRTC OFFER
    // ==========================================

    const handleWebRtcOffer = async (data) => {
      if (
        peerConnectionRef.current !== pc ||
        pc.signalingState === "closed" ||
        !data?.sdp
      ) {
        return;
      }

      try {
        const incomingUfrags = getIceUfrags(data.sdp.sdp || "");

        const readyForOffer =
          !makingOfferRef.current &&
          (pc.signalingState === "stable" ||
            isSettingRemoteAnswerPendingRef.current);

        const offerCollision = !readyForOffer;

        ignoreOfferRef.current = !isPolite && offerCollision;

        if (ignoreOfferRef.current) {
          incomingUfrags.forEach((ufrag) => {
            ignoredIceUfragsRef.current.add(ufrag);
          });

          iceCandidateQueueRef.current = iceCandidateQueueRef.current.filter(
            (candidate) => {
              const ufrag = getCandidateUfrag(candidate);
              return !ufrag || !incomingUfrags.has(ufrag);
            },
          );

          console.log("Ignoring colliding offer (impolite peer).");
          return;
        }

        if (offerCollision && isPolite) {
          await pc.setLocalDescription({ type: "rollback" });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        ignoreOfferRef.current = false;

        await drainIceCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          appointmentId,
          sdp: pc.localDescription,
        });

        setConnectionStatus("Connection answer sent. Media streaming...");
      } catch (err) {
        console.error("Error handling WebRTC offer:", err);
      }
    };

    // ==========================================
    // INCOMING WEBRTC ANSWER
    // ==========================================

    const handleWebRtcAnswer = async (data) => {
      if (
        peerConnectionRef.current !== pc ||
        pc.signalingState === "closed" ||
        !data?.sdp
      ) {
        return;
      }

      try {
        if (pc.signalingState !== "have-local-offer") return;

        isSettingRemoteAnswerPendingRef.current = true;

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        isSettingRemoteAnswerPendingRef.current = false;

        ignoreOfferRef.current = false;

        await drainIceCandidates();

        setConnectionStatus("Connected with participant");

        if (negotiationPendingRef.current) {
          await negotiate();
        }
      } catch (err) {
        isSettingRemoteAnswerPendingRef.current = false;
        console.error("Error setting remote answer:", err);
      }
    };

    // ==========================================
    // INCOMING ICE CANDIDATES
    // ==========================================

    const handleIceCandidate = async (data) => {
      if (
        peerConnectionRef.current !== pc ||
        pc.signalingState === "closed" ||
        !data?.candidate
      ) {
        return;
      }

      const candidate = data.candidate;
      const candidateUfrag = getCandidateUfrag(candidate);

      // Drop candidates belonging to a previously ignored offer.
      if (candidateUfrag && ignoredIceUfragsRef.current.has(candidateUfrag)) {
        return;
      }

      if (!pc.remoteDescription) {
        // Without an ICE usernameFragment, we cannot reliably
        // distinguish candidates from an ignored offer.
        if (ignoreOfferRef.current && !candidateUfrag) {
          return;
        }

        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      const remoteUfrags = getIceUfrags(pc.remoteDescription.sdp || "");

      if (
        candidateUfrag &&
        remoteUfrags.size > 0 &&
        !remoteUfrags.has(candidateUfrag)
      ) {
        return;
      }

      if (ignoreOfferRef.current && !candidateUfrag) {
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!ignoreOfferRef.current) {
          console.warn("Error adding ICE candidate:", err);
        }
      }
    };

    // ==========================================
    // CALL ENDED BY OTHER PARTICIPANT
    // ==========================================

    const handleVideoCallEnded = () => {
      handleCallEndCleanup(false);
    };

    // ==========================================
    // SOCKET RECONNECTION
    // ==========================================

    const handleSocketReconnect = () => {
      if (isTerminatedRef.current) return;

      joinedRoomRef.current = false;

      socket.emit("join_video_room", {
        appointmentId,
      });

      setConnectionStatus("Reconnected to signaling server. Restoring call...");
    };

    handlersRef.current = {
      handleVideoRoomJoined,
      handlePeerConnected,
      handlePeerDisconnected,
      handleWebRtcOffer,
      handleWebRtcAnswer,
      handleIceCandidate,
      handleVideoCallEnded,
      handleSocketReconnect,
    };

    socket.on("video_room_joined", handleVideoRoomJoined);
    socket.on("peer_connected", handlePeerConnected);
    socket.on("peer_disconnected", handlePeerDisconnected);
    socket.on("webrtc_offer", handleWebRtcOffer);
    socket.on("webrtc_answer", handleWebRtcAnswer);
    socket.on("webrtc_ice_candidate", handleIceCandidate);
    socket.on("video_call_ended", handleVideoCallEnded);
    socket.on("connect", handleSocketReconnect);

    // Enter active consultation
    setInWaitingRoom(false);
    setConnectionStatus("Joining consultation room...");

    if (socket.connected) {
      socket.emit("join_video_room", {
        appointmentId,
      });
    }
  };

  // ==========================================
  // 8. CONSULTATION TIMER
  // ==========================================

  useEffect(() => {
    let timer = null;

    if (!inWaitingRoom && !callEnded) {
      timer = setInterval(() => {
        setSecondsElapsed((seconds) => seconds + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inWaitingRoom, callEnded]);

  // ==========================================
  // 9. MICROPHONE AND CAMERA CONTROLS
  // ==========================================

  const toggleMic = () => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  };

  // ==========================================
  // 10. END CONSULTATION
  // ==========================================

  const handleCallEndCleanup = async (isInitiator = true) => {
    if (isTerminatedRef.current) return;

    isTerminatedRef.current = true;
    setCallEnded(true);

    const socket = socketRef.current;

    if (socket && isInitiator) {
      socket.emit("end_video_call", {
        appointmentId,
      });
    }

    cleanupWebRtc();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    setMediaReady(false);

    if (isInitiator) {
      try {
        await endConsultationCall(appointmentId);
      } catch (err) {
        console.warn("End call API notice:", err.message);
      }
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ==========================================
  // 11. LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-slate-400">
            Verifying video consultation credentials...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // 12. ERROR SCREEN
  // ==========================================

  if (error || !appointment) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-100">
            Consultation Unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error || "Unable to join consultation."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                user?.role === "lawyer"
                  ? "/lawyer-dashboard"
                  : "/dashboard",
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const partnerName = isClient
    ? appointment.lawyer?.user?.name || "Lawyer"
    : appointment.client?.name || "Client";

  // ==========================================
  // 13. CALL ENDED SCREEN
  // ==========================================

  if (callEnded) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-100">
            Consultation Completed
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Duration:{" "}
            <span className="font-semibold text-slate-200">
              {formatTimer(secondsElapsed)}
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(isClient ? "/dashboard" : "/lawyer-dashboard")
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-md transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>

            {isClient && (
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 cursor-pointer"
              >
                Review Your Consultation
              </button>
            )}
          </div>
        </div>

        {isReviewOpen && (
          <ReviewModal
            appointment={appointment}
            isOpen={isReviewOpen}
            onClose={() => {
              setIsReviewOpen(false);
            }}
            onReviewSubmitted={() => {
              setIsReviewOpen(false);
            }}
          />
        )}
      </main>
    );
  }

  // ==========================================
  // 14. WAITING ROOM
  // ==========================================

  if (inWaitingRoom) {
    return (
      <main className="flex min-h-screen flex-col justify-between bg-slate-950 p-4 font-sans text-white sm:p-8">
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-navy font-heading text-xs font-black text-gold">
              LC
            </div>

            <div>
              <h1 className="text-lg font-heading font-bold text-slate-100">
                Legal Consultation Room
              </h1>
              <p className="text-xs text-slate-400">
                Appointment #{appointment._id.substring(0, 8)}
              </p>
            </div>
          </div>

          <Link
            to={isClient ? "/dashboard" : "/lawyer-dashboard"}
            className="flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Room
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-8 py-8 md:grid-cols-2">
          {/* Camera Preview */}
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover ${
                !cameraEnabled ? "hidden" : ""
              }`}
            />

            {!cameraEnabled && (
              <div className="flex flex-col items-center text-slate-500">
                <VideoOff className="h-12 w-12" />
                <p className="mt-2 text-xs">Camera is turned off</p>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                disabled={!mediaReady}
                className={`rounded-full p-3 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  micEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-rose-600 text-white"
                }`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                disabled={!mediaReady}
                className={`rounded-full p-3 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  cameraEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-rose-600 text-white"
                }`}
                title={cameraEnabled ? "Turn Off Video" : "Turn On Video"}
              >
                {cameraEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="space-y-6">
            <div>
              <span className="rounded-full border border-blue-700/50 bg-blue-900/60 px-3 py-1 text-xs font-semibold text-royal">
                Encrypted Peer Consultation
              </span>

              <h2 className="mt-3 text-3xl font-heading font-extrabold text-white">
                Ready to consult with {partnerName}?
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Check your audio and video before entering. Your conversation is
                secure and private.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time</span>
                <span className="font-semibold text-slate-200">
                  {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <span className="text-right font-semibold text-emerald-400">
                  {connectionStatus}
                </span>
              </div>
            </div>

            {mediaError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {mediaError}
              </div>
            )}

            <button
              type="button"
              onClick={enterConsultation}
              disabled={!mediaReady || enteringRef.current}
              className="w-full rounded-2xl bg-gradient-to-r from-navy via-navy-light to-royal py-4 text-base font-bold text-white shadow-xl shadow-royal/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mediaReady
                ? "Enter Video Consultation"
                : "Preparing Camera and Microphone..."}
            </button>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-slate-500">
          LegalConnect Secure WebRTC Signaling • Zero recording without mutual
          authorization
        </footer>
      </main>
    );
  }

  // ==========================================
  // 15. ACTIVE CONSULTATION ROOM
  // ==========================================

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-white select-none">
      {/* Top Header */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">
            LC
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <span>{partnerName}</span>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Encrypted
              </span>
            </h2>

            <p className="text-[11px] text-slate-400">{connectionStatus}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 font-mono text-xs font-semibold text-slate-200">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </header>

      {/* Video Streams */}
      <div className="relative flex flex-1 items-center justify-center bg-slate-900">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/50 bg-slate-800/80 text-3xl font-bold text-slate-400">
            {partnerName.charAt(0)}
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-200">
            {partnerName}
          </h3>

          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {peersCount > 0
              ? "Connecting remote peer stream..."
              : `Waiting for ${partnerName} to enter the video call...`}
          </p>
        </div>

        {/* Local Video */}
        <div className="absolute bottom-24 right-4 z-20 aspect-video w-36 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-2xl sm:bottom-28 sm:right-6 sm:w-56">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full -scale-x-100 object-cover ${
              !cameraEnabled ? "hidden" : ""
            }`}
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

      {/* Bottom Controls */}
      <div className="absolute inset-x-0 bottom-6 z-30 flex items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-5 py-3 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={toggleMic}
            disabled={!mediaReady}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition disabled:opacity-50 ${
              micEnabled
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-red-600 text-white shadow-md shadow-red-600/30 hover:bg-red-700"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            disabled={!mediaReady}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition disabled:opacity-50 ${
              cameraEnabled
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-red-600 text-white shadow-md shadow-red-600/30 hover:bg-red-700"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCallEndCleanup(true)}
            className="flex h-12 items-center gap-2 rounded-xl bg-red-600 px-5 font-bold text-white shadow-lg shadow-red-600/40 transition hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <ReviewModal
          appointment={appointment}
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
          }}
          onReviewSubmitted={() => {
            setIsReviewOpen(false);
          }}
        />
      )}
    </main>
  );
}
