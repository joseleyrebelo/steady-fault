(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["ts-util"] = {}));
})(this, (function(exports2) {
  "use strict";
  const steady = (result) => [null, result];
  const __err = (val) => val[0];
  const __yield = (val) => val[1];
  const $ = (probing) => {
    return {
      err: __err(probing),
      yield: __yield(probing)
    };
  };
  const fault = (...args) => {
    const arg0 = args[0];
    const arg1 = args[1];
    if (Array.isArray(arg0)) {
      return arg0;
    } else if (typeof arg0 === "object") {
      return [new Fault(arg0.reason, arg0.details), null];
    } else {
      if (Array.isArray(arg1))
        return [new Fault(arg0, $(arg1).err), null];
      else return [new Fault(arg0, arg1), null];
    }
  };
  function steadyFaulter(...args) {
    const arg0 = args[0];
    const arg1 = args[1];
    const baseErrName = "SteadilyCaughtError";
    let cb, errName;
    if (typeof arg0 === "object") {
      cb = arg0.cb;
      errName = arg0.errName ? arg0.errName : baseErrName;
    } else {
      cb = arg0;
      errName = arg1 ? arg1 : baseErrName;
    }
    try {
      return steady(cb());
    } catch (e) {
      if (typeof e === "string") {
        return fault(errName, e);
      } else if (e instanceof Error) {
        return fault(errName, e);
      } else {
        return fault(errName, e);
      }
    }
  }
  class Fault {
    constructor(reason, details, key) {
      this._reason = reason;
      this._details = details;
    }
    get reason() {
      return this._reason;
    }
    get details() {
      return this._details;
    }
    toString() {
      let detailsPart = "";
      if (this._details instanceof Error) {
        detailsPart = "; Details: " + this._details.message;
      } else if (this._details instanceof Fault) {
        detailsPart = "\n" + this._details.toString();
      } else if (typeof this._details === "string") {
        detailsPart = "; Details: " + this._details;
      }
      return `Reason: ${this.reason}${detailsPart}`;
    }
  }
  exports2.$ = $;
  exports2.Fault = Fault;
  exports2.fault = fault;
  exports2.steady = steady;
  exports2.steadyFaulter = steadyFaulter;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
