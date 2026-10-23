export declare const $: <const R extends string, const T extends any>(probing: Probing<T, Fault<R>>) => {
    err: Fault<R> | null;
    yield: T | null;
};

export declare class Fault<const R extends string> {
    private _reason;
    private _details?;
    constructor(reason: R, details?: any, key?: string);
    get reason(): R;
    get details(): any;
    toString(): string;
}

export declare const fault: <const R extends string>(...args: [R, Fault<any> | string | Error | Probing<never, Fault<R>>] | [{
    reason: R;
    details?: any;
}] | [Probing<never, Fault<R>>]) => Probing<never, Fault<R>>;

export declare type Probing<S extends NonNullable<any>, F extends Fault<string> | null> = [F, null] | [null, S];

export declare const steady: <S extends NonNullable<any>>(result: S) => Probing<S, never>;

/**
 * Ensures that errors thrown (within the callback run) fall into the steadyFault flow.
 *
 * Note: if no errName is defined it defaults to "SteadilyCaughtError"
 *
 * @param callback - The callback function contain code meant to be sandboxed.
 */
export declare function steadyFaulter<const E extends string = "SteadilyCaughtError", T extends any = any>(...args: [() => T, E?] | [
    {
    cb: () => T;
    errName?: E;
}
]): Probing<T, Fault<E>>;

export { }
