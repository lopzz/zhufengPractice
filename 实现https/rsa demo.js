let p = 3,
  q = 11; //计算完立刻销毁
let N = p * q;
let fN = (p - 1) * (q - 1); //欧拉函数
let e = 7;
for (var d = 1; (e * d) % fN !== 1; d++) {
  //拓展欧几里得算法
  d++;
}
//d=3
let publicKey = { e, N };
let privateKey = { d, N };

function encrypt(data) {
  return Math.pow(data, publicKey.e) % publicKey.N;
}
function decrypt(data) {
  return Math.pow(data, privateKey.d) % privateKey.N;
}
let data = 5;
let secret = encrypt(data);
console.log(secret); //14

let _data = decrypt(secret);
console.log(_data); //5
// 1024位二进制数分解
/**
公开 N e c
私密 d
e * d % fN == 1
(p - 1) * (q - 1)
N = p * q
*/
