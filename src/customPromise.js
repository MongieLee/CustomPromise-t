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
    try {
      executor(this.resolve, this.reject);
    } catch (err) {
      this.reject(err);
    }
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
        this.successFn.shift()();
      }
    }
  };
  // 将状态更改为失败
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      while (this.failureFn.length) {
        this.failureFn.shift()();
      }
    }
  };

  // 添加默认函数，合适.then().then()不传参数
  then = (
    onFulfilled = (v) => v,
    onRejected = (e) => {
      throw e;
    }
  ) => {
    let newPromise = new CustomPromise((resolve, reject) => {
      // 这里的status是被调用then方法的promise对象的的status
      // 也就是上一个promise
      if (this.status === FUFILLED) {
        // 判断返回值是promise对象还是其他
        // 如果是其他，直接调用resolve
        // 如果是promise对象，查看promise对象返回的结果
        // 再根据promise对象返回的结果，决定调用resolve还是调用reject

        setTimeout(() => {
          try {
            let cbValue = onFulfilled(this.value);
            // 需要添加一个宏任务，才能获取到newPromise
            resolvePromis(newPromise, cbValue, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let err = onRejected(this.reason);
            // 需要添加一个宏任务，才能获取到newPromise
            resolvePromis(newPromise, err, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        // 进入到else就是一直pending状态
        // 将成功和失败回调存储

        this.successFn.push(() => {
          setTimeout(() => {
            try {
              let cbValue = onFulfilled(this.value);
              // 需要添加一个宏任务，才能获取到newPromise
              resolvePromis(newPromise, cbValue, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.failureFn.push(() => {
          setTimeout(() => {
            try {
              let err = onRejected(this.reason);
              // 需要添加一个宏任务，才能获取到newPromise
              resolvePromis(newPromise, err, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return newPromise;
  };

  static all(array) {
    const result = [];
    let rIndex = 0;
    return new CustomPromise((resolve, reject) => {
      const push = (index, value) => {
        result[index] = value;
        rIndex++;
        if (rIndex === array.length) resolve(result);
      };
      array.forEach((item, index) => {
        if (item instanceof CustomPromise) {
          item.then((value) => push(index, value), reject);
        } else {
          push(index, item);
        }
      });
    });
  }

  static resolve(value) {
    if (value instanceof CustomPromise) return value;
    return new CustomPromise((resolve) => resolve(value));
  }

  static reject(value) {
    if (value instanceof CustomPromise) return value;
    return new CustomPromise((_, reject) => reject(value));
  }
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
  // throw new Error("故意抛错");
  // resolve("测试");
  // reject("测试err");
  setTimeout(() => {
    // resolve("异步的");
    reject("异步的");
  }, 2000);
})
  .then()
  .then()
  .then(
    (success) => {
      // throw new Error("故意抛错2");
      console.log({ success });
    },
    (err) => {
      console.log("err", { err });
      return 10000;
    }
  )
  .then((v) => console.log(v));

function otherPromise() {
  return new CustomPromise((resolve) => {
    resolve("other resolve ");
  });
}
function testPromise() {
  return new CustomPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(123);
    }, 3000);
  });
}

function testFailurePromise() {
  return new CustomPromise((resolve, reject) => {
    // setTimeout(() => {
    //   reject("错了");
    // }, 0);
    reject("大错特错");
  });
}

CustomPromise.all([1, 2, testPromise(), 3]).then(
  (a) => console.log({ a }),
  (err) => console.log(err)
);

CustomPromise.resolve(testPromise()).then(
  (a) => console.log({ a }),
  (err) => console.log(err)
);

CustomPromise.resolve(1).then(
  (a) => console.log({ a }),
  (err) => console.log(err)
);

CustomPromise.reject("你错了").then(
  (a) => console.log({ a }),
  (err) => console.log(err)
);

CustomPromise.reject(testFailurePromise()).then(
  (a) => console.log({ a }),
  (err) => console.log(err)
);
