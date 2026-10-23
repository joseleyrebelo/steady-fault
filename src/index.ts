export type Probing<
  S extends NonNullable<any>,
  F extends Fault<string> | null,
> = [F, null] | [null, S];

// @Refactor - make sure it doesn't allow for err.
export const steady = <S extends NonNullable<any>>(
  result: S,
): Probing<S, never> => [null, result];

const __err = <const Reason extends string, T extends any>(
  val: Probing<T, Fault<Reason>>,
) => val[0];
const __yield = <T extends any>(val: Probing<T, Fault<string>>) => val[1];

export const $ = <const R extends string, const T extends any>(
  probing: Probing<T, Fault<R>>,
) => {
  return {
    err: __err(probing),
    yield: __yield(probing),
  };
};

// @Consider renaming it to falter (same logic as expected above)
// @consider: infer callee function name as part of the Error  ??
// @consider - if receive a Probing without an error set details as "yield is "
// - This allow for "redirecting non errors into errors" (higher control of error explicit )
// - `if (!isJsonExt.yield) return fault({ reason: "WrongFileFormat", details : isJsonExt.yield});`
export const fault = <const R extends string>(
  // @Document- having { reason: R; details?: any } stated as
  // `E extends { reason: R; details?: any }` woudln't propagate the R accross,
  // but now it can.
  ...args:
    | [R, Fault<any> | string | Error | Probing<never, Fault<R>>]
    | [{ reason: R; details?: any }]
    | [Probing<never, Fault<R>>]
): Probing<never, Fault<R>> => {
  const arg0 = args[0];
  const arg1 = args[1];

  if (Array.isArray(arg0)) {
    return arg0;
  } else if (typeof arg0 === "object") {
    return [new Fault(arg0.reason, arg0.details), null as never];
  } else {
    if (Array.isArray(arg1))
      return [new Fault(arg0, $(arg1).err), null as never];
    else return [new Fault(arg0, arg1), null as never];
  }
};

/**
 * Ensures that errors thrown (within the callback run) fall into the steadyFault flow.
 *
 * Note: if no errName is defined it defaults to "SteadilyCaughtError"
 *
 * @param callback - The callback function contain code meant to be sandboxed.
 */
export function steadyFaulter<
  const E extends string = "SteadilyCaughtError",
  T extends any = any,
>(
  ...args:
    | [() => T, E?]
    | [
        {
          cb: () => T;
          // @Evaluate - rename to faultDomain
          // - also rename steadyFaulter to steadyFault
          errName?: E;
        },
      ]
): Probing<T, Fault<E>> {
  // @Consider: Potential names : errIfThrow; catchOrOk
  // @Document -previous name sandboxed

  // @Versioning - development mode - looks into the function being referenced in
  // the callback param and checks if they could be a servicer function already
  // ok-err handles
  // - This involves registering the services functions instead of simply naming
  // them (whilst implementation)
  const arg0 = args[0];
  const arg1 = args[1];
  const baseErrName = "SteadilyCaughtError" as E;
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
    // @Versioning
    // - This same TS inference techniques can be useful when handling "details"
    // contents directly. Since it can contains string, errors, and other things
    //  this type guarding techniques are very useful. This could become their
    // own type guarding functions.

    if (typeof e === "string") {
      return fault(errName, e);
    } else if (e instanceof Error) {
      // @Performance pass only message and code??
      return fault(errName, e);
    } else {
      return fault(errName, e as any);
    }
  }
}

export class Fault<const R extends string> {
  // Fault reason in shortened form.
  private _reason: R;
  // Details on the error.
  // * @Postponed - Could contain developer notes.
  private _details?: any;
  constructor(reason: R, details?: any, key?: string) {
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
