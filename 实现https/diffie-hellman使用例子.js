// 导入crypto模块，用于创建Diffie-Hellman密钥交换对象
const { createDiffieHellman } = require("crypto");

// 创建客户端的Diffie-Hellman对象，指定密钥长度为512位
var client = createDiffieHellman(512);
// 生成客户端的公钥
var client_keys = client.generateKeys();

// 获取Diffie-Hellman算法中使用的素数
var prime = client.getPrime();
// 获取Diffie-Hellman算法中使用的生成元
var generator = client.getGenerator();

// 使用相同的素数和生成元创建服务器端的Diffie-Hellman对象
var server = createDiffieHellman(prime, generator);
// 生成服务器端的公钥
var server_keys = server.generateKeys();

// 客户端计算共享密钥
var client_secret = client.computeSecret(server_keys);
// 服务器端计算共享密钥
var server_secret = server.computeSecret(client_keys);

// 打印客户端计算出的共享密钥（十六进制格式）
console.log("client_secret: " + client_secret.toString("hex")); // caccbb77799bde7628d87d1f1619e34a68161c93d5a842fbcf82ece99ce28a7f0c5b9b52c4ef888cd5547c2a17dcd7c71c2474f2855d801f74cca2e6d2b618ad
// 打印服务器端计算出的共享密钥（十六进制格式）
console.log("server_secret: " + server_secret.toString("hex")); // caccbb77799bde7628d87d1f1619e34a68161c93d5a842fbcf82ece99ce28a7f0c5b9b52c4ef888cd5547c2a17dcd7c71c2474f2855d801f74cca2e6d2b618ad
