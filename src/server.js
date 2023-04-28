import express from "express";
// express는 http의 서버
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));

// 유저가 어떤 url로 이동하던지, 홈으로 돌려보낸다.
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// http 서버,  같은 서버에 http, ws
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// fake database, 누가 우리 서버에 연결하면, 그 connection을 여기다가 넣을 것.
const sockets = [];

wss.on("connection", (socket) => {
  // 각 브라우저가 연결될 때, 그 브라우저를 배열에 추가한다.
  sockets.push(socket);
  // connection이 생기면, socket을 받는다.
  // 여기서 socket은 연결된 브라우저를 뜻한다.
  console.log("Connected to Browser~~~");
  socket.on("close", () => console.log("Disconnected from the Browser~~~"));
  //   socket.on("message", (message) => console.log(message.toString("utf8")));
  socket.on("message", (message) => {
    sockets.forEach((aSocket) => aSocket.send(message.toString("utf-8"))); // 받은 메세지를 다시 보내는 것
  });
  //   socket.send("hello!");
});

server.listen(3000, handleListen);
