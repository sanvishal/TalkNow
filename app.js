const express = require("express");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
var connectedClients;
var users = [];
const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({ secret: "Shh, its a secret!" }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
var server = app.listen(app.get("port"), () => {
  console.log("App started at " + app.get("port"));
});
var io = socket(server);
var sockets = [];
var messageHistory = [];
io.on("connection", socket => {
  sockets.push(socket);
  console.log("socket connected at: " + socket.id);
  if (socket.id) {
    socket.emit("message-history", messageHistory);
  }
  socket.on("chat", data => {
    messageHistory.push(data);
    if (messageHistory.length > 100) messageHistory.shift();
    io.sockets.emit("chat", data);
    //console.log(messageHistory)
  });
  socket.on("typing", function(data) {
    socket.broadcast.emit("typing", data);
  });
  socket.on("new user", data => {
    users.push(data);
    //console.log(users, sockets.length);
    io.sockets.emit("users list", users);
    io.sockets.emit("users count", users.length);
    socket.broadcast.emit("new-user-notif", data);
  });
  socket.on("disconnect", function() {
    var i = sockets.indexOf(socket);
    console.log(i, socket.id);
    users.forEach(user => {
      if (user.id == socket.id) {
        users.splice(users.indexOf(user), 1);
        console.log(user.username + " disconnected");
        socket.broadcast.emit("disconnected-user", user.username);
      }
    });
    io.sockets.emit("users list", users);
    io.sockets.emit("users count", users.length);
    sockets.splice(i, 1);
  });
  //console.log(users)
});
