// 导入crypto模块，用于生成密钥对和签名验证
let { generateKeyPairSync, createSign, createVerify } = require("crypto");
// 设置一个密码短语，用于加密私钥
let passphrase = "zhufeng";
// 使用同步方法生成RSA密钥对，设置公钥和私钥的编码方式
let rsa = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase,
  },
});
// 定义待签名的内容
let content = "hello";
// 调用getSign函数获取签名
const sign = getSign(content, rsa.privateKey, passphrase);
// 验证签名并记录结果
let serverCertIsValid = verifySign(content, sign, rsa.publicKey);
// 输出验证结果
console.log("服务器证书是否合法", serverCertIsValid); // true

// 定义生成签名的函数
function getSign(content, privateKey, passphrase) {
  // 创建一个签名对象
  var sign = createSign("RSA-SHA256");
  // 更新签名对象的内容
  sign.update(content);
  // 返回签名后的结果，格式为十六进制字符串
  return sign.sign({ key: privateKey, format: "pem", passphrase }, "hex");
}

// 定义验证签名的函数
function verifySign(content, sign, publicKey) {
  // 创建一个验证签名的对象
  var verify = createVerify("RSA-SHA256");
  // 更新验证对象的内容
  verify.update(content);
  // 验证签名，并返回验证结果
  return verify.verify(publicKey, sign, "hex");
}
