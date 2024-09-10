const https = require("https");
const options = {
  hostname: "127.0.0.1",
  port: 9000,
  path: "/",
  method: "GET",
  requestCert: true, //请求客户端证书
  rejectUnauthorized: false, //不拒绝不受信任的证书
};

const req = https.request(options, (res) => {
  let buffers = [];
  res.on("data", (chunk) => {
    buffers.push(chunk);
  });
  res.on("end", () => {
    console.log(buffers.toString());
  });
});
req.end();
