const socket = io.connect("http://192.249.18.153:443", {
  transports: ["websocket"],
});

// //generate 4 digit password
// let pw = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

// socket.emit("password", { password: pw });

// document.getElementById("password").innerHTML = pw;

var btnRestart = document.getElementById("btnRestart");

// socket.on("appConnected", () => {
//   document.getElementById("appConnected").innerHTML =
//     "App is now connected. Do you want to start game?";
//   btnStart.style.display = "block";
// });

btnRestart.addEventListener("click", function () {
  window.location.href = "./index.html";
});
