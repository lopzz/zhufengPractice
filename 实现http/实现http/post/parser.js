let LF = 10, //换行  line feed
  CR = 13, //回车 carriage return
  SPACE = 32, //空格
  COLON = 58; //冒号
let PARSER_UNINITIALIZED = 0, //未解析
  START = 1, //开始解析
  REQUEST_LINE = 2, // 开始解析请求行
  HEADER_FIELD_START = 3, // 开始解析头字段
  HEADER_FIELD = 4, // 解析头字段
  HEADER_VALUE_START = 5, // 开始解析头值
  HEADER_VALUE = 6, // 解析头值
  READING_BODY_START = 7; // 读取body
READING_BODY = 8; // 读取body

class Parser {
  constructor() {
    this.state = START;
    this.requestLine = "";
    this.headers = {};
    this.body = "";
    this.headerField = "";
    this.headerValue = "";
    this.requestLineMark = 0;
    this.headerFieldMark = 0;
    this.headerValueMark = 0;
    this.bodyMark = 0;
  }

  parse(buffer) {
    let self = this,
      i = 0,
      char,
      state = this.state;
    this.bodyMark = 0;

    for (i = 0; i < buffer.length; i++) {
      char = buffer[i];
      switch (state) {
        case START:
          state = REQUEST_LINE;
          self.requestLineMark = i;
        case REQUEST_LINE:
          if (char == CR) {
            //换行
            self.requestLine = buffer.toString("utf8", self.requestLineMark, i);
            break;
          } else if (char == LF) {
            //回车
            state = HEADER_FIELD_START;
          }
          break;
        case HEADER_FIELD_START:
          if (char === CR) {
            state = READING_BODY_START;
            // 确保在发送空行后进入 READING_BODY_START 状态
            if (i < buffer.length - 1 && buffer[i + 1] === LF) {
              self.bodyMark = i + 2; // 设置 bodyMark 为下一个字符的位置
            }
            break;
          } else {
            state = HEADER_FIELD;
            self.headerFieldMark = i;
          }
        case HEADER_FIELD:
          if (char == COLON) {
            self.headerField = buffer.toString("utf8", self.headerFieldMark, i);
            state = HEADER_VALUE_START;
          }
          break;
        case HEADER_VALUE_START:
          if (char == SPACE) {
            break;
          }
          self.headerValueMark = i;
          state = HEADER_VALUE;
        case HEADER_VALUE:
          if (char === CR) {
            self.headerValue = buffer.toString("utf8", self.headerValueMark, i);
            self.headers[self.headerField] = self.headerValue;
            self.headerField = "";
            self.headerValue = "";
          } else if (char === LF) {
            state = HEADER_FIELD_START;
          }
          break;
        case READING_BODY_START:
          state = READING_BODY;
        case READING_BODY:
          self.body += buffer.toString("utf8", self.bodyMark, i + 1); // 加上当前字符
          self.bodyMark = i + 1;
          break;
        default:
          break;
      }
    }

    this.state = state;

    let [method, url] = self.requestLine.split(" ");
    return {
      method,
      url,
      headers: self.headers,
      body: self.body,
      state: self.state,
    };
  }
}

module.exports = Parser;

// 创建一个 Parser 实例
// const parser = new Parser();

// 分多次发送数据
// const buffer1 = Buffer.from("GET /abc HTTP/1.1\r\n");
// const buffer2 = Buffer.from("Host: example.com\r\n");
// const buffer3 = Buffer.from("Content-Length: 5\r\n");
// const buffer4 = Buffer.from("\r\n");
// const buffer5 = Buffer.from("h");
// const buffer6 = Buffer.from("e");
// const buffer7 = Buffer.from("llo");
// const buffer8 = Buffer.from(" adele");

// // 第一次调用 parse，发送请求行
// const result1 = parser.parse(buffer1);
// console.log(result1); // 应该为空

// // 第二次调用 parse，发送 Host 头部
// const result2 = parser.parse(buffer2);
// console.log(result2); // 应该为空

// // 第三次调用 parse，发送 Content-Length 头部
// const result3 = parser.parse(buffer3);
// console.log(result3); // 应该为空

// // 第四次调用 parse，发送空行，表示头部结束
// const result4 = parser.parse(buffer4);
// console.log(result4); // 应该为空

// // 第五次调用 parse，发送 body 的第一部分 'h'
// const result5 = parser.parse(buffer5);
// console.log(result5); // 应该为 "h"

// // 第六次调用 parse，发送 body 的第二部分 'e'
// const result6 = parser.parse(buffer6);
// console.log(result6); // 应该为 "he"

// // 第七次调用 parse，发送 body 的剩余部分 'llo'
// const result7 = parser.parse(buffer7);
// console.log(result7); // 应该为 "hello"

// // 第八次调用 parse，发送 body 的剩余部分 ' adele'
// const result8 = parser.parse(buffer8);
// console.log(result8); // 应该为 "hello adele"
