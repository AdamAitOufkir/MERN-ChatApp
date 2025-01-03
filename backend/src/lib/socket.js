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

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId] //delete user id 
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server }