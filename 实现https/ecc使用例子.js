// 导入crypto模块，用于创建ECDH（椭圆曲线Diffie-Hellman）密钥交换对象
let { createECDH } = require("crypto");

// 创建客户端的ECDH对象，指定使用secp521r1曲线
const clientDH = createECDH("secp521r1");
// 生成客户端的公钥参数
const clientDHParams = clientDH.generateKeys();

// 创建服务器端的ECDH对象，指定使用secp521r1曲线
const serverDH = createECDH("secp521r1");
// 生成服务器端的公钥参数
const serverDHParams = serverDH.generateKeys();

// 客户端计算共享密钥
const clientKey = clientDH.computeSecret(serverDHParams);
// 服务器端计算共享密钥
const serverKey = serverDH.computeSecret(clientDHParams);

// 打印客户端计算出的共享密钥（十六进制格式）
console.log("clientKey", clientKey.toString("hex")); // 007c5dba6ca75aecf60e0863e137cc4866ed19fdbefb8d89fca72fdbbc5cbea9f5b7f479f0913330f3d4e61f7d94479a51311dc063f83cd85128246baa41ba19b75f
// 打印服务器端计算出的共享密钥（十六进制格式）
console.log("serverKey", serverKey.toString("hex")); // 007c5dba6ca75aecf60e0863e137cc4866ed19fdbefb8d89fca72fdbbc5cbea9f5b7f479f0913330f3d4e61f7d94479a51311dc063f83cd85128246baa41ba19b75f
