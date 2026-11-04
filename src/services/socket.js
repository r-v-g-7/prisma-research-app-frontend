import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

let socketInstance = null;
let currentToken = null;

export function getSocket() {
    const token = localStorage.getItem("token") || "";
    const socketUrl = API_BASE_URL.replace(/\/api$/, "");

    if (!socketInstance) {
        currentToken = token;
        socketInstance = io(socketUrl, {
            auth: { token },
            transports: ["websocket", "polling"],
            autoConnect: Boolean(token),
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socketInstance.on("connect_error", (err) => {
            console.warn("WebSocket connection notice:", err.message);
        });
    } else if (token && token !== currentToken) {
        currentToken = token;
        socketInstance.auth = { token };
        if (socketInstance.connected) {
            socketInstance.disconnect();
        }
        socketInstance.connect();
    } else if (token && !socketInstance.connected && !socketInstance.active) {
        socketInstance.auth = { token };
        socketInstance.connect();
    }

    return socketInstance;
}

export function updateSocketAuth(token) {
    currentToken = token || "";
    if (socketInstance) {
        socketInstance.auth = { token: currentToken };
        if (socketInstance.connected) {
            socketInstance.disconnect();
        }
        if (currentToken) {
            socketInstance.connect();
        }
    }
}

export function disconnectSocket() {
    currentToken = null;
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export default getSocket;
