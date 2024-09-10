const dgram = require("dgram");
const udp_client = dgram.createSocket("udp4");
const { randomBytes, createHash, createECDH } = require("crypto");
const { verifySign, encrypt, decrypt } = require("./utils");
const url = require("url");
const protocol = require("./protocol");
const fs = require("fs");
const path = require("path");
const cAPublicKey = fs.readFileSync(
  path.resolve(__dirname, "CA.publicKey"),
  "utf8"
);
const clientRandom = randomBytes(8).toString("hex");
let serverRandom;
let serverPublicKey;
let ecDHServerParams;
let clientDH = createECDH("secp521r1");
let ecDHClientParams = clientDH.generateKeys();
let masterKey;
let sessionKey;
udp_client.on("listening", () => {
  const address = udp_client.address();
  console.log(`client running ${address.address}: ${address.port}`);
});
udp_client.on("message", (data, remote) => {
  let message = JSON.parse(data.toString("utf8"));
  switch (message.type) {
    case protocol.ServerHello:
      serverRandom = message.serverRandom;
      break;
    case protocol.Certificate:
      //3.Certificate 客户收到服务器证书后会用CA的公钥进行验证证书是否合法
      let { serverCert } = message;
      let { info, sign } = serverCert;
      serverPublicKey = info.publicKey;
      const serverInfoHash = createHash("sha256")
        .update(JSON.stringify(info))
        .digest("hex");
      let serverCertIsValid = verifySign(serverInfoHash, sign, cAPublicKey);
      console.log("验证服务器端证书是否正确?", serverCertIsValid);
      let urlObj = url.parse(info.domain);
      let serverDomainIsValid =
        urlObj.hostname === remote.address && urlObj.port == remote.port;
      console.log("验证服务器端域名正确?", serverDomainIsValid);
      break;
    case protocol.ServerKeyExchange:
      //4.ServerKeyExchange 客户端收到服务器的DH参数和参数签名后会用服务器的公钥进行签名，验证服务器拥有私钥
      ecDHServerParams = message.ecDHServerParams;
      ecDHServerParamsSign = message.ecDHServerParamsSign;
      let serverDHParamIsValid = verifySign(
        ecDHServerParams,
        ecDHServerParamsSign,
        serverPublicKey
      );
      console.log("验证服务器端证书DH参数是否正确?", serverDHParamIsValid);
      break;
    case protocol.ServerHelloDone:
      //6.ClientKeyExchange 客户端生成DH参数并且发给服务器
      udp_client.send(
        JSON.stringify({
          type: protocol.ClientKeyExchange,
          ecDHClientParams,
        }),
        remote.port,
        remote.address
      );
      //6.ClientKeyExchange 服务器收到客户端DH参数后加上服务器DH参数生成pre-master-key
      //再由pre-master-key生成masterKey和sessionKey
      preMasterKey = clientDH
        .computeSecret(Buffer.from(ecDHServerParams, "hex"))
        .toString("hex");
      masterKey = createHash("md5")
        .update(preMasterKey + clientRandom + serverRandom)
        .digest("hex");
      sessionKey = createHash("md5")
        .update(masterKey + clientRandom + serverRandom)
        .digest("hex");
      //7.Change Cipher Spec 通知服务器客户端已经准备好切换成加密通信了
      udp_client.send(
        JSON.stringify({
          type: protocol.ChangeCipherSpec,
        }),
        remote.port,
        remote.address
      );
      //8.加密握手信息并传送给服务器端
      udp_client.send(
        JSON.stringify({
          type: protocol.EncryptedHandshakeMessage,
          data: encrypt("i am client", sessionKey),
        }),
        remote.port,
        remote.address
      );
      break;
    case protocol.EncryptedHandshakeMessage:
      //10.客户端你好到服务器的加密握手数据
      //这个报文的目的就是告诉对端自己在整个握手过程中收到了什么数据，发送了什么数据。来保证中间没人篡改报文
      console.log("客户端收到解密后的数据:", decrypt(message.data, sessionKey));
      break;
    default:
      break;
  }
});
udp_client.on("error", (error) => {
  console.log(error);
});
//1.ClientHello 客户端向服务器发送客户端随机数，服务器需要保存在服务器端
udp_client.send(
  JSON.stringify({
    type: protocol.ClientHello,
    clientRandom,
  }),
  20000,
  "127.0.0.1"
);
