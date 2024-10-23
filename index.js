const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import cors
const { spawn } = require("child_process");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// Enable CORS for all routes and origins
app.use(cors());

// Body parser middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
// Configure Socket.io with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now, restrict this in production
    methods: ["GET", "POST"],
  },
});

// Map to store the number of users in each room
const roomUsersCount = new Map();

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Event for user joining a specific room
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;

    // Check the number of users in the room
    const usersInRoom = roomUsersCount.get(roomId) || 0;

    if (usersInRoom >= 2) {
      // If there are already 2 users in the room, deny entry
      socket.emit("room-full", `Room ${roomId} is full. You cannot join.`);
      console.log(`Room ${roomId} is full. User ${emailId} cannot join.`);
      return;
    }

    // Increment the user count and store it
    roomUsersCount.set(roomId, usersInRoom + 1);

    // Join the room
    socket.join(roomId);
    console.log(`${emailId} joined room: ${roomId}`);

    // Notify the user that they have joined the room
    socket.emit("joined-room", `You have joined room ${roomId}.`);

    // Notify others in the room that a new user has joined
    socket.broadcast.to(roomId).emit("user-joined", { emailId });

    // Log the number of users in the room
    console.log(
      `Number of users in room ${roomId}: ${roomUsersCount.get(roomId)}`
    );

    // Handle when the user leaves or disconnects
    socket.on("disconnect", () => {
      console.log(
        `Client ${emailId} with socket id: ${socket.id} disconnected`
      );

      // Decrease the number of users in the room
      const currentUsers = roomUsersCount.get(roomId) || 0;
      if (currentUsers > 0) {
        roomUsersCount.set(roomId, currentUsers - 1);
      }

      console.log(
        `Updated number of users in room ${roomId}: ${roomUsersCount.get(
          roomId
        )}`
      );
    });
  });

  // Event for receiving and broadcasting messages within the room
  socket.on("msg", (data) => {
    const { roomId, message, emailId } = data;

    // Broadcast the message to everyone in the room (including the sender)
    io.to(roomId).emit("msg", { emailId, message });
    console.log(`Message from ${emailId} in room ${roomId}: ${message}`);
  });

  // WebRTC signaling: Handle offer from the user and forward to other users in the room
  socket.on("webrtc-offer", (data) => {
    const { roomId, offer } = data;
    socket.to(roomId).emit("webrtc-offer", { offer, from: socket.id });
  });

  // WebRTC signaling: Handle answer from the user and forward to other users in the room
  socket.on("webrtc-answer", (data) => {
    const { roomId, answer } = data;
    socket.to(roomId).emit("webrtc-answer", { answer, from: socket.id });
  });

  // WebRTC signaling: Handle ICE candidate exchange between peers
  socket.on("webrtc-ice-candidate", (data) => {
    const { roomId, candidate } = data;
    socket
      .to(roomId)
      .emit("webrtc-ice-candidate", { candidate, from: socket.id });
  });

  // Binary Stream
  socket.on("binaryStream", (stream) => {
    console.log("Binary Stream Incommiy", stream);
    ffmpegProcess.stdin.write(stream, (err) => {
      console.log("Err", err);
    });
  });
});

//Used for streaming videos
const options = [
  "-f",
  "webm", // Input format
  "-i",
  "-",
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-tune",
  "zerolatency",
  "-r",
  `${25}`,
  "-g",
  `${25 * 2}`,
  "-keyint_min",
  25,
  "-crf",
  "25",
  "-pix_fmt",
  "yuv420p",
  "-sc_threshold",
  "0",
  "-profile:v",
  "main",
  "-level",
  "3.1",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-ar",
  128000 / 4,
  "-f",
  "flv",
  `rtmp://a.rtmp.youtube.com/live2/`,
];

const ffmpegProcess = spawn("ffmpeg", options);

ffmpegProcess.stdout.on("data", (data) => {
  console.log(`ffmpeg stdout: ${data}`);
});
// Start the server
server.listen(port, () => console.log(`Server is running on port: ${port}`));
