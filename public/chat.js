var socket = io.connect();
var message = document.getElementById("message");
var handle = document.getElementById("handle");
var send = document.getElementById("send");
var output = document.getElementById("output");
var chat = document.getElementById("chat-window");
var typing = document.getElementById("typing");
var numusers = document.getElementById("num-users");
var setidbtn = document.getElementById("set-id");
var userlist = document.getElementById("list-items");
var start = document.getElementById("start-chat");
var authenticated = false;
message.disabled = true;
send.disabled = true;
start.disabled = true;
var clients = [],
  myid;
socket.on("connect", function() {
  myid = socket.io.engine.id;
});
socket.on("users list", data => {
  clients = data;
  userlist.innerHTML = "";
  clients.forEach(client => {
    userlist.innerHTML += client.username + "<br>";
  });
});
socket.on("new-user-notif", data => {
  M.toast({
    html: data.username + " has joined :)",
    classes: "rounded"
  });
});
socket.on("disconnected-user", data => {
  M.toast({
    html: data + " left :(",
    classes: "rounded"
  });
});
socket.on("message-history", data => {
  data.forEach(ele => {
    if (!ele.isgif) {
      output.innerHTML +=
        '<div class = "message-blob message-item-other">\
			<div class = "z-depth-2 card-panel other-message">\
			<strong class = "recipient other">' +
        ele.username +
        "   </strong>" +
        ele.message +
        "</div></div>";
    } else {
      output.innerHTML +=
        '<div class = "message-blob message-item-other">\
			<div class = "z-depth-2 card-panel other-message">\
			<strong class = "recipient other">' +
        ele.username +
        "   </strong>" +
        "<img src = '" +
        ele.message +
        "'></img>" +
        "</div></div>";
    }
  });
});
setidbtn.addEventListener("click", () => {
  if (handle.value != "") {
    if (!clients.includes(handle.value)) {
      socket.emit("new user", { username: handle.value, id: myid });
      setidbtn.disabled = true;
      start.disabled = false;
      handle.disabled = true;
      authenticated = true;
    } else {
      play();
      output.innerHTML +=
        '<div class = "greet-bot message-blob message-item-mine"> <p class = "z-depth-2 card-panel my-message"><strong class = "recipient me">' +
        "UniBot 🤖" +
        "   </strong>" +
        "A user has already taken this name, if you are finding hard to choose a name, <b>Just mash the keyboard</b>" +
        "</p></div>";
    }
  } else {
    play();
    output.innerHTML +=
      '<div class = "greet-bot message-blob message-item-mine"> <p class = "z-depth-2 card-panel my-message"><strong class = "recipient me">' +
      "UniBot 🤖" +
      "   </strong>" +
      "Please Enter a valid handle!" +
      "</p></div>";
  }
});
start.addEventListener("click", () => {
  if (authenticated) {
    start.disabled = true;
    message.disabled = false;
    send.disabled = false;
  }
});
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}
message.addEventListener("keypress", function(event) {
  socket.emit("typing", handle.value);
  if (event.keyCode == 13) {
    send.click();
  }
});
socket.on("typing", function(data) {
  typing.innerHTML = "<p><em>" + data + " is typing...</em></p>";
});
socket.on("chat", data => {
  if (data.username == handle.value) {
    if (!data.isgif) {
      output.innerHTML +=
        '<div class = "message-blob message-item-mine">\
				<div class = "z-depth-2 card-panel my-message">\
				<strong class="recipient me" > ' +
        data.username +
        "   </strong>" +
        data.message +
        "</div></div>";
    } else {
      output.innerHTML +=
        '<div class = "message-blob message-item-mine">\
				<div class = "z-depth-2 card-panel my-message">\
				<strong class="recipient me" > ' +
        data.username +
        "   </strong>" +
        "<img src = '" +
        data.message +
        "'></img>" +
        "</div></div>";
    }
  } else {
    play();
    if (!data.isgif) {
      output.innerHTML +=
        '<div class = "message-blob message-item-other">\
				<div class = "z-depth-2 card-panel other-message">\
				<strong class = "recipient other">' +
        data.username +
        "   </strong>" +
        data.message +
        "</div></div>";
    } else {
      output.innerHTML +=
        '<div class = "message-blob message-item-other">\
				<div class = "z-depth-2 card-panel other-message">\
				<strong class = "recipient other">' +
        data.username +
        "   </strong>" +
        "<img src = '" +
        data.message +
        "'></img>" +
        "</div></div>";
    }
  }
  $("#chat-window").animate(
    {
      scrollTop: chat.scrollHeight - chat.clientHeight
    },
    200
  );
});
numusers.innerHTML =
  "there's no user online Now, Maybe call your friends and have a game";
socket.on("users count", data => {
  numusers.innerHTML = "<strong> There are " + data + " user(s) online...";
  //displayNotification(data);
});

/*
Notification.requestPermission(function(status) {
  console.log("Notification permission status:", status);
  if (Notification.permission == "granted") {
    displayNotification();
  }
});

function displayNotification(num) {
  if (Notification.permission == "granted") {
    navigator.serviceWorker.getRegistration().then(function(reg) {
      reg.showNotification(
        "There are " + num + "users online. Go Chat! Have Fun"
      );
    });
  }
}*/

const publicVapidKey =
  "BKhdDA-ug_AyH77FhQ6_t8YafwxJGgDECUnJgDgLehq7xM0Dde3iHrObcBCjDF7eqQ1F8rJTAu-5JA3HRAgIwm0";

if ("serviceWorker" in navigator) {
  console.log("Registering service worker");

  run().catch(error => console.error(error));
}

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function run() {
  console.log("Registering service worker");
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/"
  });
  console.log("Registered service worker");

  console.log("Registering push");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Registered push");

  console.log("Sending push");
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json"
    }
  });
  console.log("Sent push");
}
