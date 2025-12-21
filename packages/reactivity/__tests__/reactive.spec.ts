import { it, describe, expect } from "vitest"
import { isReactive, isReadonly, reactive, readonly } from "../src/reactive";
import { isProxy } from "node:util/types";

describe("reactive test", () => {
    it("Object", () => {
        const original = { foo: 1 };
        const observed = reactive(original);
        expect(observed).not.toBe(original);
    })

    it("realize isReactive and isReadonly", () => {
        const user = { foo: 1 }
        const test1 = reactive(user);
        expect(isReactive(test1)).toBe(true)
        expect(isReactive(user)).toBe(false)

        const test2 = readonly(user);
        expect(isReadonly(test2)).toBe(true)
        expect(isReadonly(user)).toBe(false)

        expect(isProxy(test2)).toBe(true)
        expect(isProxy(user)).toBe(false)
    })

})