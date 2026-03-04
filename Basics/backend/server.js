import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

const app = express();
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});


io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join-room", (roomId) => {
        console.log("User " + socket.id + " joined room " + roomId);
        socket.join(roomId);
    });

    socket.on("offer", (data) => {
        console.log("Offer received from " + socket.id + " to room " + data.roomId);
        socket.to(data.roomId).emit("offer", data);
    });

    socket.on("answer", (data) => {
        console.log("Answer received from " + socket.id + " to room " + data.roomId);
        socket.to(data.roomId).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
        console.log("ICE candidate received from " + socket.id + " to room " + data.roomId);
        socket.to(data.roomId).emit("ice-candidate", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server started on port 3000");
});
