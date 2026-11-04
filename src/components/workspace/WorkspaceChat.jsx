import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "@/services/socket";
import { 
  Send, 
  Smile, 
  Paperclip, 
  CornerDownRight, 
  CheckCircle2, 
  Scale, 
  FileText,
  Users,
  Radio
} from "lucide-react";

export default function WorkspaceChat({
    workspaceId,
    currentUser,
    onConvertToTask,
    onConvertToDecision
}) {
    const [messages, setMessages] = useState([
        {
            id: "msg_init_1",
            text: "Welcome to the collaborative research lab! This channel provides real-time team synchronization, experiment telemetry review, and rapid hypothesis debate.",
            sender: { name: "Prism Assistant", role: "System" },
            createdAt: new Date().toISOString()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!workspaceId) return;
        const socket = getSocket();

        // 1. Join room
        socket.emit("join_workspace", { workspaceId });

        // 2. Listen for messages
        const handleNewMessage = (payload) => {
            if (payload.workspaceId === workspaceId) {
                setMessages(prev => [...prev, payload.message]);
            }
        };

        // 3. Listen for presence
        const handlePresence = (payload) => {
            if (payload.workspaceId === workspaceId) {
                setOnlineMembers(payload.members || []);
            }
        };

        // 4. Listen for typing
        const handleTyping = ({ workspaceId: wsId, name, isTyping }) => {
            if (wsId === workspaceId) {
                setTypingUsers(prev => {
                    if (isTyping) {
                        return prev.includes(name) ? prev : [...prev, name];
                    } else {
                        return prev.filter(n => n !== name);
                    }
                });
            }
        };

        socket.on("new_workspace_message", handleNewMessage);
        socket.on("workspace_presence", handlePresence);
        socket.on("user_typing", handleTyping);

        return () => {
            socket.emit("leave_workspace", { workspaceId });
            socket.off("new_workspace_message", handleNewMessage);
            socket.off("workspace_presence", handlePresence);
            socket.off("user_typing", handleTyping);
        };
    }, [workspaceId]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const socket = getSocket();
        socket.emit("send_workspace_message", {
            workspaceId,
            text: inputText.trim()
        });

        // Also notify typing stopped
        socket.emit("workspace_typing", { workspaceId, isTyping: false });
        setInputText("");
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        const socket = getSocket();
        socket.emit("workspace_typing", {
            workspaceId,
            isTyping: e.target.value.length > 0
        });
    };

    return (
        <div className="flex flex-col h-[560px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            {/* Top Presence & Channel Header */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#</span>
                    <span className="text-xs font-bold text-slate-900">general-discussion</span>
                    <span className="text-[11px] text-slate-400">• Real-time collaboration</span>
                </div>

                {/* Online Presence Indicator */}
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px] text-slate-600 font-medium">
                        {onlineMembers.length > 0 ? `${onlineMembers.length} active now` : "Live sync ready"}
                    </span>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {messages.map((msg, idx) => {
                    const isSystem = msg.sender?.role === "System";
                    const isMe = currentUser && ((currentUser._id || currentUser.id) === msg.sender?._id);

                    return (
                        <div
                            key={msg.id || idx}
                            className={`flex gap-3 group transition ${isSystem ? "opacity-80" : ""}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {msg.sender?.name?.charAt(0) || "U"}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">
                                        {msg.sender?.name || "Researcher"}
                                    </span>
                                    {msg.sender?.role && (
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded capitalize">
                                            {msg.sender.role}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 group-hover:border-slate-200 transition">
                                    {msg.text}
                                </div>

                                {/* Convert message to research object actions (Discord / Notion style) */}
                                {!isSystem && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition text-[11px] text-slate-400 pt-0.5">
                                        {onConvertToTask && (
                                            <button
                                                onClick={() => onConvertToTask(msg.text)}
                                                className="hover:text-indigo-600 flex items-center gap-1 hover:underline"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                                <span>Convert to Task</span>
                                            </button>
                                        )}
                                        {onConvertToDecision && (
                                            <button
                                                onClick={() => onConvertToDecision(msg.text)}
                                                className="hover:text-purple-600 flex items-center gap-1 hover:underline"
                                            >
                                                <Scale className="w-3 h-3 text-purple-600" />
                                                <span>Log as Decision</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-1 bg-slate-50 text-[11px] text-slate-500 font-mono italic border-t border-slate-100">
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
            )}

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Message research lab (enter to send)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition shadow-2xs"
                    title="Send message"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
