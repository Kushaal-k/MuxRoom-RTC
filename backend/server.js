import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.get("/api/turn", async (req, res) => {
    try {
        const tokenId = process.env.CF_TOKEN_ID;
        const apiToken = process.env.CF_API_TOKEN;

        if (!tokenId || !apiToken) {
            console.error("Cloudflare credentials missing in .env");
            return res.status(500).json({ error: "Cloudflare credentials not configured" });
        }

        const response = await fetch(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${tokenId}/credentials/generate-ice-servers`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ttl: 86400 }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Cloudflare API error:", error);
            return res.status(response.status).json({ error: "Failed to fetch TURN credentials" });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});


const roomMap = new Map();

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("join-room", ({roomId, username}) => {
        if(!roomId || !username || roomId.length > 100) {
            return;
        }

        if(roomMap.has(roomId) && roomMap.get(roomId).size >= 6){
            socket.emit("room-full");
            return;
        }
        console.log("User " + socket.id + " joined room " + roomId);
        socket.join(roomId);

        if(!roomMap.has(roomId)) {
            roomMap.set(roomId, new Map());
        }

        roomMap.get(roomId).set(socket.id, { username });

        const existingUsers = Array.from(roomMap.get(roomId).entries())
        .filter(([socketId]) => socketId !== socket.id)
        .map(([socketId, data]) => ({
            socketId, 
            username: data.username
           })
        );
        socket.emit("existing-users", existingUsers);

        socket.to(roomId).emit("user-joined", { socketId: socket.id, username });
    });

    socket.on("offer", ({target, sdp}) => {
        console.log("Offer received from " + socket.id + " to room " + target);
        io.to(target).emit("offer", {sdp, target: socket.id});
    });

    socket.on("answer", ({target, sdp}) => {
        console.log("Answer received from " + socket.id + " to room " + target);
        io.to(target).emit("answer", {sdp, target: socket.id});
    });

    socket.on("ice-candidate", ({target, candidate}) => {
        console.log("ICE candidate received from " + socket.id + " to room " + target);
        io.to(target).emit("ice-candidate", {candidate, target: socket.id});
    });

    socket.on("peer-left", ({roomId}) => {
        socket.to(roomId).emit("peer-left", {socketId: socket.id});
        if(roomMap.has(roomId)) {
            roomMap.get(roomId).delete(socket.id);

            if(roomMap.get(roomId).size === 0){
                roomMap.delete(roomId);
            }
        }
    });

    socket.on("disconnect", () => {
        for(const [roomId, members] of roomMap) {
            if(members.has(socket.id)) {
                members.delete(socket.id);
                socket.to(roomId).emit("peer-left", {socketId: socket.id});
                if(members.size === 0){
                    roomMap.delete(roomId);
                }
            }
        }
        console.log("User disconnected: " + socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server started on port 3000");
});
