import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

let socketInstance = null;

export function getSocket() {
    if (!socketInstance) {
        const token = localStorage.getItem("token");
        const socketUrl = API_BASE_URL.replace(/\/api$/, "");

        socketInstance = io(socketUrl, {
            auth: {
                token: token || ""
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socketInstance.on("connect", () => {
            console.log("⚡ Prism Real-Time WebSocket connected:", socketInstance.id);
        });

        socketInstance.on("connect_error", (err) => {
            console.warn("WebSocket connection notice:", err.message);
        });
    }

    return socketInstance;
}

export function updateSocketAuth(token) {
    if (socketInstance) {
        socketInstance.auth = { token };
        if (!socketInstance.connected) {
            socketInstance.connect();
        }
    }
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export default getSocket;

