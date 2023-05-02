const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

const socket = new WebSocket(`ws://${window.location.host}`);
// 여기서의 socket은 서버로의 연결을 뜻한다.

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 메세지 받기
// 메시지란 event
socket.addEventListener("open", () => {
  console.log("Connected to Server~~~");
});

socket.addEventListener("message", (message) => {
  console.log("Just got this: ", message, " from Server");
  console.log("New Messages: ", message.data, " from Server");
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server Nononononono");
});

// 서버로 메시지 보내기
// setTimeout(() => {
//   socket.send("hello from the browser!");
// }, 3000);

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value)); // front-end에서 back-end로 보내는 중

  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`;
  messageList.append(li);
  console.log("Msginput : " + input.value);
  input.value = "";
}

function handleNickSubmit(evnet) {
  evnet.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  console.log("NIckinput : " + input.value);
  input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
