// 导入crypto模块，用于生成RSA密钥对
let { generateKeyPairSync } = require("crypto");

// 设置CA（证书颁发机构）的密码短语
const ca_passphrase = "ca";

// 生成RSA密钥对，设置公钥和私钥的编码方式
let CA = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: ca_passphrase,
  },
});

// 导入fs模块，用于文件系统操作
let fs = require("fs");

// 导入path模块，用于处理路径
let path = require("path");

// 将公钥写入文件 "CA.publicKey"
fs.writeFileSync(path.resolve(__dirname, "CA.publicKey"), CA.publicKey);

// 将私钥写入文件 "CA.privateKey"
fs.writeFileSync(path.resolve(__dirname, "CA.privateKey"), CA.privateKey);
