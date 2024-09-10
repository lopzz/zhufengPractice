// 导入crypto模块，用于生成密钥对、签名验证及哈希计算
let {
  generateKeyPairSync,
  createSign,
  createVerify,
  createHash,
} = require("crypto");
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
// 创建包含域名和公钥的信息对象
const info = {
  domain: "http://127.0.0.1:8080",
  publicKey: rsa.publicKey,
};
// 创建SHA-256哈希对象，更新内容为信息对象的JSON字符串表示形式，并获取十六进制格式的摘要
const hash = createHash("sha256").update(JSON.stringify(info)).digest("hex");
// 调用getSign函数获取签名
const sign = getSign(hash, rsa.privateKey, passphrase);
// 创建包含信息对象和签名的对象
const cert = { info, sign };

// 验证签名并记录结果
let certIsValid = verifySign(hash, cert.sign, rsa.publicKey);
// 输出验证结果
console.log("certIsValid", certIsValid); // true

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
