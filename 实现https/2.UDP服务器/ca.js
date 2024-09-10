// 导入crypto模块，用于创建哈希对象
const { createHash } = require("crypto");

// 定义生成签名的函数
const { getSign } = require("./utils");

// 设置CA（证书颁发机构）的密码短语
const ca_passphrase = "ca";

// 导入fs模块，用于文件系统操作
const fs = require("fs");

// 导入path模块，用于处理路径
const path = require("path");

// 读取CA的私钥文件
let cAPrivateKey = fs.readFileSync(
  path.resolve(__dirname, "CA.privateKey"),
  "utf8"
);

// 定义请求证书的函数
function requestCert(info) {
  // 创建SHA-256哈希对象
  const infoHash = createHash("sha256")
    .update(JSON.stringify(info)) // 更新哈希对象的内容
    .digest("hex"); // 获取十六进制格式的摘要

  // 生成签名
  const sign = getSign(infoHash, cAPrivateKey, ca_passphrase);

  // 返回包含信息和签名的对象
  return { info, sign };
}

// 导出requestCert函数
exports.requestCert = requestCert;
