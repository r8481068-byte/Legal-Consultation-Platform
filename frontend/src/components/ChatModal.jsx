import { useState, useEffect, useRef } from "react";
import { getSocket } from "../services/chatService";
import { getAppointmentMessages, sendMessage } from "../services/chatService";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  X,
  FileText,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from "lucide-react";

export default function ChatModal({ appointment, isOpen, onClose, onOpenDocuments }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !appointment) return;

    let mounted = true;

    // Load initial message history
    const loadMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAppointmentMessages(appointment._id);
        if (mounted) {
          setMessages(res.messages || []);
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load chat history.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMessages();

    // Setup Socket.IO
    const socket = getSocket();
    if (socket) {
      socket.emit("join_chat_room", { appointmentId: appointment._id });

      const handleNewMessage = (newMsg) => {
        if (newMsg.appointment?.toString() === appointment._id.toString()) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
      };

      const handleUserTyping = (data) => {
        if (data.userId !== user?.id && data.userId !== user?._id) {
          setIsTyping(true);
          setTypingUser(data.name || "Participant");
        }
      };

      const handleUserStopTyping = () => {
        setIsTyping(false);
        setTypingUser("");
      };

      const handleReconnect = () => {
        socket.emit("join_chat_room", { appointmentId: appointment._id });
      };

      socket.on("connect", handleReconnect);
      socket.on("new_message", handleNewMessage);
      socket.on("user_typing", handleUserTyping);
      socket.on("user_stop_typing", handleUserStopTyping);

      return () => {
        mounted = false;
        socket.emit("leave_chat_room", { appointmentId: appointment._id });
        socket.off("connect", handleReconnect);
        socket.off("new_message", handleNewMessage);
        socket.off("user_typing", handleUserTyping);
        socket.off("user_stop_typing", handleUserStopTyping);
      };
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, appointment, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && appointment) {
      socket.emit("typing", { appointmentId: appointment._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { appointmentId: appointment._id });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");

    const socket = getSocket();
    if (socket && appointment) {
      socket.emit("stop_typing", { appointmentId: appointment._id });
    }

    try {
      const res = await sendMessage(appointment._id, {
        text: textToSend,
        messageType: "text"
      });

      setMessages((prev) => {
        if (prev.some((m) => m._id === res.message?._id)) return prev;
        return [...prev, res.message];
      });
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const isClient = user?.role === "client";
  const partnerName = isClient
    ? appointment.lawyer?.user?.name || "Lawyer"
    : appointment.client?.name || "Client";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-sm font-bold text-white">
              {partnerName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{partnerName}</h3>
              <p className="text-xs text-slate-500">
                Consultation Chat • {appointment.consultationType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDocuments && (
              <button
                type="button"
                onClick={onOpenDocuments}
                title="View Case Documents"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-blue-700" />
                Case Documents
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="mt-3 font-bold text-slate-800">No messages yet</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Start the discussion with {partnerName} regarding your legal consultation.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe =
                senderId?.toString() === user?.id?.toString() ||
                senderId?.toString() === user?._id?.toString() ||
                senderId?.toString() === user?.userId?.toString();

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMe
                        ? "bg-blue-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] font-bold text-blue-700 mb-1">
                        {msg.sender?.name || partnerName}
                      </p>
                    )}

                    {msg.messageType === "document" ? (
                      <div className="flex items-center gap-2 py-1">
                        <FileText className="h-5 w-5 text-amber-300" />
                        <div>
                          <p className="font-semibold underline">
                            {msg.attachment?.title || "Attached Document"}
                          </p>
                          <span className="text-[10px] opacity-80">
                            {msg.attachment?.originalName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}

                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        isMe ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        msg.isRead ? (
                          <CheckCheck className="h-3 w-3 text-cyan-300" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              {typingUser} is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t border-slate-200 bg-white p-3.5"
        >
          {onOpenDocuments && (
            <button
              type="button"
              onClick={onOpenDocuments}
              title="Share / View Case Documents"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="rounded-xl bg-blue-900 p-2.5 text-white shadow-sm hover:bg-blue-800 disabled:opacity-40 transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
