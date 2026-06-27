uni.addInterceptor({
  returnValue (res) {
    if (!(!!res && (typeof res === "object" || typeof res === "function") && typeof res.then === "function")) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res) => {
        if (!res) return resolve(res)
        const err = res.errMsg
        if (err && err.indexOf(':fail') > -1) {
          reject(res)
        } else {
          resolve(res)
        }
      });
    });
  },
});