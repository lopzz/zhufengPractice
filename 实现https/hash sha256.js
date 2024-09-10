var crypto = require("crypto");

const salt = "123456";
const content = "hello";
const sha256 = (str) =>
  crypto.createHmac("sha256", salt).update(str, "utf8").digest("hex");

let ret = sha256(content);
console.log(ret); // ac28d602c767424d0c809edebf73828bed5ce99ce1556f4df8e223faeec60edd (64位十六进制 = 256位二进制)
