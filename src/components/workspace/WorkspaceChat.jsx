import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "@/services/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Send,
    CheckCircle2,
    Scale,
    Hash
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
            text: "Welcome to the lab channel. Use this space for real-time team updates, experiment results, and hypothesis discussion.",
            sender: { name: "Prism Lab", role: "System" },
            createdAt: new Date().toISOString()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (!workspaceId) return;
        const socket = getSocket();

        const joinRoom = () => {
            setIsConnected(true);
            socket.emit("join_workspace", { workspaceId });
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        if (socket.connected) {
            joinRoom();
        }
        socket.on("connect", joinRoom);
        socket.on("disconnect", handleDisconnect);

        const handleNewMessage = (payload) => {
            if (payload.workspaceId === workspaceId) {
                setMessages((prev) => [...prev, payload.message]);
            }
        };

        const handlePresence = (payload) => {
            if (payload.workspaceId === workspaceId) {
                setOnlineMembers(payload.members || []);
            }
        };

        const handleTyping = ({ workspaceId: wsId, name, isTyping }) => {
            if (wsId === workspaceId) {
                setTypingUsers((prev) => {
                    if (isTyping) {
                        return prev.includes(name) ? prev : [...prev, name];
                    }
                    return prev.filter((n) => n !== name);
                });
            }
        };

        socket.on("new_workspace_message", handleNewMessage);
        socket.on("workspace_presence", handlePresence);
        socket.on("user_typing", handleTyping);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("disconnect", handleDisconnect);
            socket.off("new_workspace_message", handleNewMessage);
            socket.off("workspace_presence", handlePresence);
            socket.off("user_typing", handleTyping);
        };
    }, [workspaceId]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const socket = getSocket();
        socket.emit("send_workspace_message", {
            workspaceId,
            text: inputText.trim()
        });

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
        <div className="flex flex-col h-[520px] bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
            {/* Channel Header */}
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-xs font-semibold text-[#172033]">general-discussion</span>
                    <span className="hidden sm:inline text-xs text-[#64748B]">· Real-time channel</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-[#15803D]" : "bg-slate-300"}`} />
                    <span className="text-xs text-[#64748B] font-medium">
                        {onlineMembers.length > 0
                            ? `${onlineMembers.length} active`
                            : isConnected
                                ? "Connected"
                                : "Connecting..."}
                    </span>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                    const isSystem = msg.sender?.role === "System";
                    const isMe = currentUser && ((currentUser._id || currentUser.id) === msg.sender?._id);

                    return (
                        <div
                            key={msg.id || idx}
                            className="flex gap-3 group"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 border ${
                                    isMe
                                        ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                                        : "bg-[#EEF2FF] border-indigo-200 text-[#4F46E5]"
                                }`}
                            >
                                {msg.sender?.name?.charAt(0)?.toUpperCase() || "R"}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-[#172033]">
                                        {msg.sender?.name || "Researcher"}
                                    </span>
                                    {msg.sender?.role && (
                                        <span className="text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 rounded capitalize">
                                            {msg.sender.role}
                                        </span>
                                    )}
                                    <span className="text-[11px] text-[#64748B]">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>

                                <div className="text-sm text-[#172033] leading-relaxed whitespace-pre-line bg-[#F8FAFC] px-3 py-2 rounded-lg border border-[#E2E8F0]">
                                    {msg.text}
                                </div>

                                {!isSystem && (
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition text-xs text-[#64748B] pt-0.5">
                                        {onConvertToTask && (
                                            <button
                                                type="button"
                                                onClick={() => onConvertToTask(msg.text)}
                                                className="hover:text-[#4F46E5] inline-flex items-center gap-1 transition"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-[#4F46E5]" />
                                                <span>Convert to Milestone</span>
                                            </button>
                                        )}
                                        {onConvertToDecision && (
                                            <button
                                                type="button"
                                                onClick={() => onConvertToDecision(msg.text)}
                                                className="hover:text-[#4F46E5] inline-flex items-center gap-1 transition"
                                            >
                                                <Scale className="w-3 h-3 text-[#4F46E5]" />
                                                <span>Log as Decision</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-1.5 bg-[#F8FAFC] text-xs text-[#64748B] border-t border-[#E2E8F0]">
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
            )}

            {/* Message Input Bar */}
            <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2"
            >
                <Input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Write a message to the lab..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={!inputText.trim()}
                    size="default"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                </Button>
            </form>
        </div>
    );
}
