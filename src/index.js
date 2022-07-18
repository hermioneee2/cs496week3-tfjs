// let pw = Math.floor(Math.random() * 8999) + 1000;

let pw = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

document.getElementById("password").innerHTML = pw;

var btnStart = document.getElementById("btnStart");

btnStart.addEventListener("click", function () {
  if (1 == 2) {
  } else {
    window.location.href = "./main.html";
  }
});
