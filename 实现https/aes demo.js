const crypto = require("crypto");

function encrypt(data, key, iv) {
  let decipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  decipher.update(data);
  return decipher.final("hex");
}

function decrypt(data, key, iv) {
  let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.update(data, "hex");
  return decipher.final("utf8");
}

let key = "1234567890123456";
let iv = "1234567890123456";
let data = "hello";
let encrypted = encrypt(data, key, iv);
console.log("数据加密后:", encrypted); // 39b071b5bf699723ef33a644741bfa31
let decrypted = decrypt(encrypted, key, iv);
console.log("数据解密后:", decrypted); // hello
