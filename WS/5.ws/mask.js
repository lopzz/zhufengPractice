function maskOrUnmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i % 4];
  }
  return buffer;
}

const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]); // 随机写的字节数组
const buffer = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f]); // 随机写的字节数组
const masked = maskOrUnmask(buffer, mask); // 掩码
console.log(masked); // <Buffer 7a 51 3a 14 7d>

const unmasked = maskOrUnmask(buffer, mask); // 反掩码
console.log(unmasked); // <Buffer 68 65 6c 6c 6f>，和buffer一致
