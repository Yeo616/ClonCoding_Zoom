const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);
// 여기서의 socket은 서버로의 연결을 뜻한다.

// 메세지 받기
// 메시지란 event
socket.addEventListener("open", () => {
  console.log("Connected to Server~~~");
});

socket.addEventListener("message", (message) => {
  console.log("Just got this: ", message, " from Server");
  console.log("New Messages: ", message.data, " from Server");
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
  socket.send(input.value); // front-end에서 back-end로 보내는 중

  console.log("input : " + input.value);
  input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
