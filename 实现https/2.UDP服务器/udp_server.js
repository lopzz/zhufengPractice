const dgram = require("dgram");
const udp_server = dgram.createSocket("udp4");
const protocol = require("./protocol");
const {
  generateKeyPairSync,
  randomBytes,
  createHash,
  createECDH,
} = require("crypto");
const server_passphrase = "server";
const { getSign, decrypt, encrypt } = require("./utils");
require("./createCA");
const { requestCert } = require("./ca");

let serverRSA = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: server_passphrase,
  },
});
let serverRandom = randomBytes(8).toString("hex");
const serverInfo = {
  domain: "http://127.0.0.1:20000",
  publicKey: serverRSA.publicKey,
};
let serverCert = requestCert(serverInfo);
let clientRandom;
const serverDH = createECDH("secp521r1");
const ecDHServerParams = serverDH.generateKeys().toString("hex");
const ecDHServerParamsSign = getSign(
  ecDHServerParams,
  serverRSA.privateKey,
  server_passphrase
);
let masterKey;
let sessionKey;
udp_server.on("listening", () => {
  const address = udp_server.address();
  console.log(`server running ${address.address}: ${address.port}`);
});
udp_server.on("message", (data, remote) => {
  let message = JSON.parse(data);
  switch (message.type) {
    case protocol.ClientHello:
      //2.在服务器生成随机数，通过ServerHello发送给客户端
      clientRandom = message.clientRandom;
      udp_server.send(
        JSON.stringify({
          type: protocol.ServerHello,
          serverRandom, //服务器端随机数
          cipherSuite: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA", //约定的加密套件
        }),
        remote.port,
        remote.address
      );
      //3.Certificate 服务器把包含自己公钥的证书发送给客户端进行验证
      udp_server.send(
        JSON.stringify({
          type: protocol.Certificate,
          serverCert, //服务器公钥证书
        }),
        remote.port,
        remote.address
      );
      //4.ServerKeyExchange 服务器端生成DH参数，并用服务器私钥进行签名发给客户端
      udp_server.send(
        JSON.stringify({
          type: protocol.ServerKeyExchange,
          ecDHServerParams,
          ecDHServerParamsSign,
        }),
        remote.port,
        remote.address
      );
      //5.Server Hello Done 服务器发送完成
      udp_server.send(
        JSON.stringify({
          type: protocol.ServerHelloDone,
        }),
        remote.port,
        remote.address
      );
      break;
    case protocol.ClientKeyExchange:
      //6.ClientKeyExchange 服务器收到客户端DH参数后加上服务器DH参数生成pre-master-key
      //再由pre-master-key生成masterKey和sessionKey
      let { ecDHClientParams } = message;
      preMasterKey = serverDH
        .computeSecret(Buffer.from(ecDHClientParams, "hex"))
        .toString("hex");
      masterKey = createHash("md5")
        .update(preMasterKey + clientRandom + serverRandom)
        .digest("hex");
      sessionKey = createHash("md5")
        .update(masterKey + clientRandom + serverRandom)
        .digest("hex");
      break;
    case protocol.ChangeCipherSpec:
      //9.服务器通知客户端服务器也已经准备好切换加密套件了
      udp_server.send(
        JSON.stringify({
          type: protocol.ChangeCipherSpec,
        }),
        remote.port,
        remote.address
      );
      break;
    case protocol.EncryptedHandshakeMessage:
      console.log("服务器收到解密后的数据:", decrypt(message.data, sessionKey));
      //10.服务器收到客户端的加密数据后向客户端回复加密数据
      udp_server.send(
        JSON.stringify({
          type: protocol.EncryptedHandshakeMessage,
          data: encrypt("i am server", sessionKey),
        }),
        remote.port,
        remote.address
      );
      break;
    default:
      break;
  }
});
udp_server.on("error", (error) => {
  console.log(error);
});
udp_server.bind(20000, "127.0.0.1");
