const { reject } = require("lodash");
require("./customPromise");

// const promise = new Promise(function (reslove, reject) {
//   // reslove(100);
//   reject(new Error("promise rejected"));
// });

// const returnPromise = promise.then(
//   (v) => console.log(v),
//   (err) => console.log(err)
// );
// 返回的是新的Promise对象

function ajax(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";
    // 会自动解析为json对象
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      }
      reject(new Error(this.statusText));
    };
    xhr.send();
  });
}

// ajax("http://localhost:3000/user").then(
//   (res) => {
//     console.log(res);
//     return ajax("/fuckfds");
//   },
//   (err) => console.log({ err })
// );
// 在onFulfilled函数中，返回了一个promise，根据规则，会等待promise执行完毕
// 但此时并没有捕获到异常，因为onRejected是定义给ajax("http://localhost:3000/user")注册回调
// 并没有人去管onFulfilled中的Promise的任何回调时间

// ajax("http://localhost:3000/user")
//   .then((res) => {
//     console.log(res);
//     return ajax("/fuckfds");
//   })
//   .catch((err) => {
//     console.log({ err });
//   });
// 这里能捕获到的原因是失败回调注册在上一个then返回的promise对象上
// 对象是rejected所以能被捕获到
// Promise链条上任何一个异常都会被一直向后传递，直至被捕获
// catch更像是为整个Promise链条注册的回调

// Promise.resolve("我直接返回了").then((value) => console.log(value));

// new Promise((resolve) => {
//   resolve("我直接返回了二周目");
// }).then((value) => console.log(value));
// // 这俩是等价的

// const source = Promise.resolve("source");
// const target = Promise.resolve(source);
// console.log(source === target);

// Promise.resolve({
//   then: (resolve) => {
//     resolve("foo");
//   },
// }).then(() => console.log("run>?"));
// 实现了thenable，可以被then的对象

// 同步执行多个Promise的方式
// ajax("http://localhost:3000/url")
//   .then((value) => {
//     return Promise.all(Object.values(value).map(ajax));
//   })
//   .then((values) => {
//     console.log(values);
//   });

// 只有有任意一个Promise状态成功或失败就视为结束
// const request = ajax("http://localhost:3000/url");
// const timeout = new Promise((_, reject) => {
//   setTimeout(() => {
//     reject(new Error("timeout"));
//   }, 500);
// });

// Promise.race([request, timeout])
//   .then((value) => console.log(value))
//   .catch((error) => console.log(error));

new Promise((a, b) => {});

function* foo() {
  console.log("run");
  try {
    const res = yield "caonima";
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

const genrator = foo();
// 此时不会执行，只是得到了生成器对象

// const result = genrator.next();
// 调用next才会执行函数体
// 会得到yield返回的值，会被包装成一个对象
// {value:"run",done:false},done表示是否完成状态

// const result2 = genrator.next("fuck");
// 再次执行next，"fuck"字符串会作为yield语句的返回值

// genrator.throw(new Error("custom error"));
// 抛出异常

// 函数生成器
function* main() {
  try {
    const result1 = yield ajax("http://localhost:3000/user");
    console.log("result1");
    console.log(result1);

    const result2 = yield ajax("http://localhost:3000/user2");
    console.log("result2");
    console.log(result2);
  } catch (err) {
    console.log("抓到你了");
    console.log(err);
  }
}

async function main2() {
  try {
    const result1 = await ajax("http://localhost:3000/user");
    console.log("result1");
    console.log(result1);

    const result2 = await ajax("http://localhost:3000/user");
    console.log("result2");
    console.log(result2);
  } catch (err) {
    console.log("抓到你了");
    console.log(err);
  }
}
// main2();
// const v1 = g2.next();
// v1.value.then((data) => {
//   console.log("data");
//   console.log(data);
//   if (v1.done) return;
//   const r1 = g2.next(data);
//   r1.value.then((data) => {
//     console.log("data2");
//     console.log(data);
//     g2.next(data);
//   });
// });

function co(genrator) {
  const g2 = genrator();
  function handleResult(result) {
    if (result.done) return;
    result.value.then(
      (data) => {
        handleResult(g2.next(data));
      },
      (err) => g2.throw(err)
    );
  }
  handleResult(g2.next());
}

co(main);
