import { Server } from "socket.io"
import http from "http"
import express from "express"
import Message from "../models/message.model.js";  // Add this import at the top

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}
// store online users
const userSocketMap = {} //{userId:socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id)

    const userId = socket.handshake.query.userId
    if (userId) userSocketMap[userId] = socket.id //b7al dictionnaire dial python clé valeur

    //broadcast to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("markMessagesAsSeen", async ({ senderId, receiverId }) => {
        try {
            // Only mark messages where we're the receiver and they're from the sender
            await Message.updateMany(
                {
                    senderId: senderId,
                    receiverId: receiverId,
                    seen: false
                },
                { $set: { seen: true } }
            );

            // Notify sender that messages were seen
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { receiverId });
            }
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    });

    socket.on("initiateCall", ({ to, isVideoCall, roomId }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            console.log(`Sending call request to ${to} (Socket: ${receiverSocketId})`);
            io.to(receiverSocketId).emit("incomingCall", {
                from: userId,
                isVideoCall,
                roomId
            });
        } else {
            socket.emit("callRejected"); // User is offline
        }
    });

    socket.on("acceptCall", ({ to, roomId }) => {
        const callerSocketId = getReceiverSocketId(to);
        if (callerSocketId) {
            console.log(`Call accepted by ${userId}, notifying caller ${to}`);
            io.to(callerSocketId).emit("callAccepted", { roomId });
        }
    });

    socket.on("rejectCall", ({ to }) => {
        const callerSocketId = getReceiverSocketId(to);
        if (callerSocketId) {
            io.to(callerSocketId).emit("callRejected");
        }
    });

    socket.on("userJoinedCall", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userJoinedCall");
        }
    });

    socket.on("userLeftCall", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userLeftCall");
        }
    });

    socket.on("userJoinedCall", ({ to, roomId }) => {
        const otherUserSocketId = getReceiverSocketId(to);
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("otherUserJoined", { roomId });
        }
    });

    socket.on("userLeftCall", ({ to, roomId }) => {
        const otherUserSocketId = getReceiverSocketId(to);
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("otherUserLeft", { roomId });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId] //delete user id 
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server }