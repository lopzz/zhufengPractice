// 导入 crypto 模块，用于生成密钥对和加密/解密操作
let { generateKeyPairSync, privateEncrypt, publicDecrypt } = require("crypto");

// 生成 RSA 密钥对
let rsa = generateKeyPairSync("rsa", {
  // 设置密钥长度为 1024 位
  modulusLength: 1024,
  // 公钥编码方式
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  // 私钥编码方式，并设置口令短语
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: "server_passphrase",
  },
});

// 定义待加密的消息
let message = "hello";

// 使用私钥对消息进行加密
let enc_by_prv = privateEncrypt(
  {
    key: rsa.privateKey, // 使用生成的私钥
    passphrase: "server_passphrase", // 私钥的口令短语
  },
  Buffer.from(message, "utf8") // 将消息转换为 Buffer 对象
);

// 打印加密后的消息（以十六进制字符串形式）
console.log("加密后的信息： " + enc_by_prv.toString("hex"));

// 使用公钥对加密后的消息进行解密
let dec_by_pub = publicDecrypt(rsa.publicKey, enc_by_prv);

// 打印解密后的消息
console.log("解密后的信息： " + dec_by_pub.toString("utf8"));
