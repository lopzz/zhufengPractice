const https = require("https");
const fs = require("fs");
const path = require("path");

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "ssl/server.private.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "ssl/server.crt")),
};

https
  .createServer(options, (req, res) => {
    res.end("hello world\n");
  })
  .listen(9000);

console.log("server https is running 9000");
