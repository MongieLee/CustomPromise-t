/*
  1. Promise就是一个类，在执行这个类的时候，需要传递一个执行器进去，执行器会立即执行
  2. Promise中有三种状态，分别为成功fulfilled 失败rejected 等待pending
    pending -> fulfilled
    pending -> rejected
    一旦状态确定就不可更改
  3. resolve和reject函数时用来更改状态的
    resolve: fulfilled
    reject: rejected
  4. then方法判断状态 成功调用resolve，失败调用reject
*/
const FUFILLED = "fulfilled";
const REJECTED = "rejected";
const PENDING = "pending";

// 解析返回值类型
const resolvePromis = (newPromise, value, resolve, reject) => {
  // 如果返回了当前Promise，抛出类型错误
  if (newPromise === value) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (value instanceof CustomPromise) {
    value.then(resolve, reject);
  } else {
    resolve(value);
  }
};

class CustomPromise {
  constructor(executor) {
    executor(this.resolve, this.reject);
  }

  // promise状态
  status = PENDING;

  // 成功值
  value = undefined;
  // 失败原因
  reason = undefined;

  successFn = [];
  failureFn = [];

  // 箭头函数的目的是绑定this为当前promise实例对象
  // 将状态更改为成功
  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FUFILLED;
      this.value = value;
      while (this.successFn.length) {
        this.successFn.shift()(this.value);
      }
    }
  };
  // 将状态更改为失败
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      while (this.failureFn.length) {
        this.failureFn.shift()(this.reason);
      }
    }
  };

  then = (onFulfilled, onRejected) => {
    let newPromise = new CustomPromise((resolve, reject) => {
      if (this.status === FUFILLED) {
        // 判断返回值是promise对象还是其他
        // 如果是其他，直接调用resolve
        // 如果是promise对象，查看promise对象返回的结果
        // 再根据promise对象返回的结果，决定调用resolve还是调用reject
        setTimeout(() => {
          let cbValue = onFulfilled(this.value);
          // 需要添加一个宏任务，才能获取到newPromise
          resolvePromis(newPromise, cbValue, resolve, reject);
        }, 0);
      } else if (this.status === REJECTED) {
        onRejected(this.reason);
      } else {
        // 进入到else就是一直pending状态
        // 将成功和失败回调存储
        this.successFn.push(onFulfilled);
        this.failureFn.push(onRejected);
      }
    });
    return newPromise;
  };
}

const promise = new Promise((resolve, reject) => {
  // resolve(1);
  // reject("failure");
  resolve("haha");
});
promise
  .then((value) => {
    console.log(value);
    return otherPromise();
  })
  .then(
    (a) => console.log({ a }),
    (b) => console.log(b)
  );

function otherPromise() {
  return new CustomPromise((resolve) => {
    resolve("other resolve ");
  });
}

console.log("------------CustomPromise-------------");

// 会报循环调用错误
// const p1 = new Promise((a, b) => {
//   a("chengognle");
// });
// p2 = p1.then((res) => {
//   console.log(res);
//   return p2;
// });

// p2.then(
//   () => {},
//   (err) => console.log(err.message)
// );

const promise2 = new CustomPromise((resolve, reject) => {
  resolve("测试");
});
let child = promise2.then((value) => {
  console.log(value);
  return child;
});

child.then(
  (a) => console.log({ a }),
  (b) => console.log({ b })
);

function otherPromise() {
  return new CustomPromise((resolve) => {
    resolve("other resolve ");
  });
}
