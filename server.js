import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express()
const server = createServer(app)

const port = 3000;

app.use(express.static("."));
// app.use(express.static("."));

const io = new Server(server);

// io.on("connection", socket => {
//   socket.emit("hello", "world");

//   socket.on("howdy", arg => {
//     console.log(arg);
//   });
// });

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// This line allows `<script src="/socket.io/socket.io.js"></script>` in html
// file. Otherwise you get a mime type error.
// https://stackoverflow.com/questions/8689877/cant-find-socket-io-js
io.on('connection', socket => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});