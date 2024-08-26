const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  console.log(req.url);

  if (["/get.html"].includes(req.url)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(__dirname, "static", req.url.slice(1))));
  } else if (req.url === "/get") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("get");
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(8080, () => {
  console.log("server is running");
});
