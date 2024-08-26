const net = require("net");
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    let request = data.toString();
    let [requestLine, ...headerRows] = request.split("\r\n");
    let [method, path] = requestLine.split(" ");
    let headers = headerRows.slice(0, -2).reduce((memo, row) => {
      let [key, value] = row.split(": ");
      memo[key] = value;
      return memo;
    }, {});
    console.log("method", method);
    console.log("path", path);
    console.log("headers", headers);
    let rows = [];
    rows.push(`HTTP/1.1 200 OK`);
    rows.push(`Content-Type: text/plain`);
    rows.push(`Date: ${new Date().toGMTString()}`);
    rows.push(`Connection: keep-alive`);
    rows.push(`Transfer-Encoding: chunked`);
    let responseBody = "get";
    rows.push(
      `\r\n${Buffer.byteLength(responseBody).toString(
        16
      )}\r\n${responseBody}\r\n0`
    );
    let response = rows.join("\r\n");
    socket.end(response);
  });
});

server.on("error", (err) => {
  console.log(err);
});

server.listen(8080, () => {
  console.log("服务器已经启动", server.address());
});
