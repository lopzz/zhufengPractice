const http = require("http");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const url = require("url");
const server = http.createServer(function (req, res) {
  const { pathname } = url.parse(req.url);
  if (["/get.html", "/post.html", "/upload.html"].includes(pathname)) {
    res.writeHead(200, { "Context-type": "text-html" });
    res.end(fs.readFileSync(path.join(__dirname, "static", pathname.slice(1))));
  } else if (pathname === "/get") {
    res.writeHead(200, { "Context-type": "text-plain" });
    res.end("get");
  } else if (pathname === "/post") {
    let buffers = [];
    req.on("data", (data) => {
      buffers.push(data);
    });
    req.on("end", () => {
      console.log("method", req.method);
      console.log("url", req.url);
      console.log("headers", req.headers);
      let body = Buffer.concat(buffers);
      console.log("body", body.toString());
      res.statusCode = 200;
      res.setHeader("Context-type", "text-plain");
      res.write(body);
      res.end();
    });
  } else if (req.url === "/upload") {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      console.log("fields", fields);
      console.log("files", files.avatar);
      let avatar = files.avatar;
      let filePath = path.join(__dirname, "static", avatar.name);
      fs.writeFileSync(filePath, fs.readFileSync(avatar.path));
      res.statusCode = 200;
      res.setHeader("Context-type", "text-plain");
      res.write(JSON.stringify({ ...fields, avatar: filePath }));
      res.end();
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});
server.listen(8080);
