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


const roomMap = new Map();

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join-room", ({roomId, username}) => {
        console.log("User " + socket.id + " joined room " + roomId);
        socket.join(roomId);

        if(!roomMap.has(roomId)) {
            roomMap.set(roomId, new Map());
        }

        roomMap.get(roomId).set(socket.id, { username });

        const existingUsers = Array.from(roomMap.get(roomId).values());
        socket.emit("existing-users", existingUsers);

        socket.to(roomId).emit("user-joined", { socketId: socket.id, username });
    });

    socket.on("offer", ({roomId, sdp}) => {
        console.log("Offer received from " + socket.id + " to room " + roomId);
        socket.to(roomId).emit("offer", {roomId, sdp});
    });

    socket.on("answer", ({roomId, sdp}) => {
        console.log("Answer received from " + socket.id + " to room " + roomId);
        socket.to(roomId).emit("answer", {roomId, sdp});
    });

    socket.on("ice-candidate", ({roomId, candidate}) => {
        console.log("ICE candidate received from " + socket.id + " to room " + roomId);
        socket.to(roomId).emit("ice-candidate", {roomId, candidate});
    });

    socket.on("peer-left", ({roomId}) => {
        socket.to(roomId).emit("peer-left", {roomId});
    })
    socket.on("disconnect", () => {
        // for(const [roomId, members] of roomMap) {
        //     if(member.has(socket))
        // }
        console.log("User disconnected: " + socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server started on port 3000");
});
