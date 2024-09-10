const {
  createCipheriv,
  createDecipheriv,
  createSign,
  createVerify,
} = require("crypto");
function encrypt(data, key) {
  let decipher = createCipheriv("aes-256-cbc", key, "1234567890123456");
  decipher.update(data);
  return decipher.final("hex");
}

function decrypt(data, key) {
  let decipher = createDecipheriv("aes-256-cbc", key, "1234567890123456");
  decipher.update(data, "hex");
  return decipher.final("utf8");
}
function getSign(content, privateKey, passphrase) {
  var sign = createSign("RSA-SHA256");
  sign.update(content);
  return sign.sign({ key: privateKey, format: "pem", passphrase }, "hex");
}
function verifySign(content, sign, publicKey) {
  var verify = createVerify("RSA-SHA256");
  verify.update(content);
  return verify.verify(publicKey, sign, "hex");
}
module.exports = {
  encrypt,
  decrypt,
  getSign,
  verifySign,
};
