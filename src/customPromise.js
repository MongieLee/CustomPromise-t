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
  rejectFn = [];

  // 箭头函数的目的是绑定this为当前promise实例对象
  // 将状态更改为成功
  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FUFILLED;
      this.value = value;
    }
  };
  // 将状态更改为失败
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
    }
  };

  then = (onFulfilled, onRejected) => {
    if (this.status === FUFILLED) {
      onFulfilled(this.value);
    } else if (this.status === REJECTED) {
      onRejected(this.reason);
    }
  };
}

const promise = new CustomPromise((resolve, reject) => {
  // resolve(1);
  reject("failure");
});
promise.then(
  (value) => {
    console.log(value);
  },
  (reason) => {
    console.log(reason);
  }
);
console.log("------------CustomPromise-------------");
