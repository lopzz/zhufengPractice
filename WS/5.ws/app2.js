let net = require("net"); // net模块用于创建tcp服务
let CODE = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
let crypto = require("crypto");

// 模拟服务端响应头返回
/**
* 
GET ws://localhost:8888/ HTTP/1.1/r/n
Connection: Upgrade/r/n
Upgrade: websocket/r/n
Sec-WebSocket-Version: 13/r/n
Sec-WebSocket-Key: O/SldTn2Th7GfsD07IxrwQ==/r/n
/r/n
*/

/**
*
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: H8BlFmSUnXVpM4+scTXjZIwFjzs= 
*/

let server = net.createServer((socket) => {
  socket.once("data", (data) => {
    // 建立连接，使用once
    data = data.toString(); // buffer转字符串
    if (data.match(/Connection: Upgrade/)) {
      let rows = data.split("\r\n");
      //   rows格式：
      //   'GET / HTTP/1.1',
      //   'Host: localhost:9999',
      //   'Connection: Upgrade',
      //   'Pragma: no-cache',
      //   'Cache-Control: no-cache',
      //   'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      //   'Upgrade: websocket',
      //   'Origin: null',
      //   'Sec-WebSocket-Version: 13',
      //   'Accept-Encoding: gzip, deflate, br, zstd',
      //   'Accept-Language: zh-CN,zh;q=0.9',
      //   'Sec-WebSocket-Key: MwGApjw5wYjUrCrC2Rr1Cg==',
      //   'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits',
      //   '',
      //   ''
      rows = rows.slice(1, -2);
      let headers = {};
      rows.reduce((memo, item) => {
        let [key, value] = item.split(": ");
        memo[key] = value;
        return memo;
      }, headers);
      console.log(44444, headers);
      if (headers["Sec-WebSocket-Version"] == "13") {
        let secWebSocketKey = headers["Sec-WebSocket-Key"];
        let secWebSocketAccept = crypto
          .createHash("sha1")
          .update(secWebSocketKey + CODE)
          .digest("base64");
        let response = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${secWebSocketAccept}`,
          "\r\n",
        ].join("\r\n");
        socket.write(response);
        //后面所有的格式都是基于websocket协议的
        socket.on("data", (buffers) => {
          // 通讯，使用on
          // data默认是一个Buffer
          let fin = buffers[0] & (0b10000000 === 0b10000000); // 结束位是true还是false,第0个字节第一位
          let opcode = buffers[0] & 0b00001111; // 操作码,第0个字节后4位
          let isMask = buffers[1] & (0b10000000 == 0b10000000); // 是否进行了掩码
          let payloadLength = buffers[1] & 0b01111111; // 获得第1个字节后7位
          let mask = buffers.slice(2, 6); // 掩码键，这里假设payloadLength是7位，下面根据这个来写代码
          let payload = buffers.slice(6); // 携带的真实数据
          payload = maskOrUnmask(payload, mask);
          let response = Buffer.alloc(2 + payload.length);
          response[0] = 0b10000000 | opcode;
          response[1] = payloadLength;
          payload.copy(response, 2); // 将 payload 的内容复制到 response 的第二个字节开始的位置，等于把客户端的消息又传了回去
          socket.write(response);
        });
      }
    }
  });
});
server.listen(9999);

function maskOrUnmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i % 4];
  }
  return buffer;
}
