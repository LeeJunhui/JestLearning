/**
 * 在JavaScript中执行异步代码是很常见的。 当你有以异步方式运行的代码时，Jest 需要知道当前它测试的代码是否已完成，然后它可以转移到另一个测试。 Jest有若干方法处理这种情况。
 */

/**
 * 回调
 * 例如，假设您有一个 fetchData(callback) 函数，获取一些数据并在完成时调用 callback(data)。 你期望返回的数据是一个字符串 'peanut butter'
 * 默认情况下，Jest 测试一旦执行到末尾就会完成。 那意味着该测试将不会按预期工作：
 */

function fetchData(callback) {
  setTimeout(() => {
    callback("peanut butter");
  }, 1000);
}

// 不要这样做！
// test("the data is peanut butter", () => {
//   function callback(data) {
//     expect(data).toBe("peanut butter");
//   }

//   fetchData(callback);
// });
// 问题在于一旦fetchData执行结束，此测试就在没有调用回调函数前结束。

/**
 * 还有另一种形式的 test，解决此问题。 使用单个参数调用 done，而不是将测试放在一个空参数的函数。 Jest会等done回调函数执行结束后，结束测试。
 */
test("the data is peanut butter", (done) => {
  function callback(data) {
    try {
      expect(data).toBe("peanut butter");
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});
// 若 expect 执行失败，它会抛出一个错误，后面的 done() 不再执行。
// 若我们想知道测试用例为何失败，我们必须将 expect 放入 try 中，
// 将 error 传递给 catch 中的 done函数。 否则，最后控制台将显示一个超时错误失败，
// 不能显示我们在 expect(data) 中接收的值。

/**
 * Promises
 * If your code uses promises, there is a more straightforward way to handle asynchronous tests.
 * Return a promise from your test, and Jest will wait for that promise to resolve.
 */

function fetchDataPromiseVersion() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("peanut butter");
    }, 1000);
  });
}

test("promise the data is peanut butter", () => {
  return fetchDataPromiseVersion().then((data) => {
    expect(data).toBe("peanut butter");
  });
});
// 一定不要忘记把 promise 作为返回值。
// 如果你忘了 return 语句的话，在 fetchData 返回的这个 promise 被 resolve、then() 有机会执行之前，测试就已经被视为已经完成了。

function fetchDataPromiseRejectVersion() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve("peanut butter");
      reject("error");
    }, 1000);
  });
}

test("promise the fetch fails with an error", () => {
  expect.assertions(1);
  return fetchDataPromiseRejectVersion().catch((e) =>
    expect(e).toMatch("error")
  );
});
// If you expect a promise to be rejected, use the .catch method. 请确保添加 expect.assertions 来验证一定数量的断言被调用。
// Otherwise, a fulfilled promise would not fail the test.

/**
 * 您也可以在 expect 语句中使用 .resolves 匹配器，Jest 将等待此 Promise 解决。 如果承诺被拒绝，则测试将自动失败
 */
test(".resovles the data is peanut butter", () => {
  return expect(fetchDataPromiseVersion()).resolves.toBe("peanut butter");
});

/**
 * If you expect a promise to be rejected, use the .rejects matcher. 它参照工程 .resolves 匹配器。 如果 Promise 被拒绝，则测试将自动失败。
 */
test(".rejects the fetch fails with an error", () => {
  return expect(fetchDataPromiseRejectVersion()).rejects.toMatch("error");
});

/**
 * Async/Await
 */
/**
 * 您可以在测试中使用 async 和 await。 To write an async test, use the async keyword in front of the function passed to test.
 */
test("async await the data is peanut butter", async () => {
  const data = await fetchDataPromiseVersion();
  expect(data).toBe("peanut butter");
});

test("async await the fetch fails with an error", async () => {
  expect.assertions(1);
  try {
    await fetchDataPromiseRejectVersion();
  } catch (e) {
    expect(e).toMatch("error");
  }
});

test("async await and .resovles the data is peanut butter", async () => {
  await expect(fetchDataPromiseVersion()).resolves.toBe("peanut butter");
});

test("async await and .rejects the fetch fails with an error", async () => {
  await expect(fetchDataPromiseRejectVersion()).rejects.toMatch("error");
});
