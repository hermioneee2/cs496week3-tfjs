const socket = io.connect("http://192.249.18.153:443", {
  transports: ["websocket"],
});

// var messages = document.getElementById("messages");
// var form = document.getElementById("form");
// var input = document.getElementById("input");

// form.addEventListener("submit", function (e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit("chat message", input.value);
//     input.value = "";
//   }
// });

// socket.on("chat message", function (msg) {
//   var item = document.createElement("li");
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });

// io.emit("some event", {
//   someProperty: "some value",
//   otherProperty: "other value",
// }); // This will emit the event to all connected sockets

//generate 4 digit password
let pw = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

socket.emit("password", { password: pw });

document.getElementById("password").innerHTML = pw;

var btnStart = document.getElementById("btnStart");

// btnStart.addEventListener("click", function () {
//   socket.on("app_connected", (myArg) => {
//     if (myArg == 0) {
//       window.alert("Mobile app is not yet connected.");
//     } else {
//       window.location.href = "./main.html";
//     }
//   });
// });

socket.on("appConnected", () => {
  document.getElementById("appConnected").innerHTML =
    "App is now connected. Do you want to start game?";
  btnStart.style.display = "block";
  // window.location.href = "./main.html";
});

btnStart.addEventListener("click", function () {
  socket.emit("startGame", "startGame");
  window.location.href = "./main.html";
});
