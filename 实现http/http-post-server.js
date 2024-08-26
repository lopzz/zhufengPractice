const http = require("http");
const fs = require("fs");
const path = require("path");
const server = http.createServer((req, res) => {
  if (["/get.html", "/post.html"].includes(req.url)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(__dirname, "static", req.url.slice(1))));
  } else if (req.url === "/get") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("get");
  } else if (req.url === "/post") {
    let buffers = [];
    req.on("data", (data) => {
      buffers.push(data);
    });
    req.on("end", () => {
      console.log("method", req.method);
      console.log("url", req.url);
      console.log("headers", req.headers);
      console.log("buffers", buffers);
      let body = Buffer.concat(buffers);
      console.log("body", body.toString());
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.write(body);
      res.end();
    });
  }
});
server.listen(8080);
