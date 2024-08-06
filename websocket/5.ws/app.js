let express = require("express");
let app = express();

app.use(express.static(__dirname));

app.listen(3000);

let websocketServer = require("ws").Server;
let server = new websocketServer({ port: 8888 });
server.on("connection", (socket) => {
  console.log("2.服务器监听到了客户端请求");
  socket.on("message", (message) => {
    console.log("4.客户端连接过来的消息", message);
    socket.send("5.服务器说" + message);
  });
});
