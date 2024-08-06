let crypto = require("crypto");
let key = "6EOd//m4oYh+QwU/EK0Kyw==";
let CODE = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

let result = crypto
  .createHash("sha1")
  .update(key + CODE)
  .digest("base64");
console.log(result);
