import express from "express";
// express는 http의 서버
import http from "http";
// import WebSocket from "ws";
// import SocketIo from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

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
const httpServer = http.createServer(app);
// const wss = new WebSocket.Server({ server });
// const wsServer = SocketIo(httpServer);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const sids = wsServer.sockets.adapter.sids;
  const rooms = wsServer.sockets.adapter.rooms;
  //   const {sockets:{adapter:{sids,rooms}}} = wsServer
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// 연결을 받음
wsServer.on("connection", (socket) => {
  wsServer.socketsJoin("announcement"); // socket이 연결되었을 때 모든 socket이 announcement방에 입장
  socket["nickname"] = "Someone";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event : ${event}`);
  });
  console.log(socket);

  socket.on("enter_room", (roomName, done) => {
    console.log(`socket.id : ${socket.id}`);
    console.log(socket.rooms); //set{<socket.id}

    socket.join(roomName); // 룸을 만드려면, 룸 이름만 적어주면 된다.
    console.log(socket.rooms); //다른 room 이름
    done();

    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms()); // send message to all sockets
  });
  socket.on("disconnecting", () => {
    // disconnecting event는 socket이 방을 떠나기 바로 직전에 발생
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 0);
    });
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms()); // send message to all sockets
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// fake database, 누가 우리 서버에 연결하면, 그 connection을 여기다가 넣을 것.
// const sockets = [];

// wss.on("connection", (socket) => {
//   // 각 브라우저가 연결될 때, 그 브라우저를 배열에 추가한다.
//   sockets.push(socket);

//   // 대화명을 정하지 않은 사람
//   socket["nickname"] = "Nobody";

//   // connection이 생기면, socket을 받는다.
//   // 여기서 socket은 연결된 브라우저를 뜻한다.
//   console.log("Connected to Browser~~~");
//   socket.on("close", () => console.log("Disconnected from the Browser~~~"));
//   //   socket.on("message", (message) => console.log(message.toString("utf8")));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     console.log(message);

//     // any Massege
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         ); // 받은 메세지를 다시 보내는 것
//       case "nickname":
//         console.log(message.payload);
//         socket["nickname"] = message.payload;
//     }
//   });
//   //   socket.send("hello!");
// });

httpServer.listen(3000, handleListen);
