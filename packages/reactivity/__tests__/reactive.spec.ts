import { it, describe, expect } from "vitest"
import { isReactive, isReadonly, reactive, readonly, shallowReadonly, toRaw } from "../src/reactive";
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

    it("should return same proxy for the same target", () => {
        const original = { foo: 1 };
        // 第一次调用：创建并缓存
        const observedA = reactive(original);

        // 第二次调用：应该直接返回缓存
        const observedB = reactive(original);

        // 【核心断言】：检查引用是否严格相等
        expect(observedA).toBe(observedB);

        // 同时也验证一下它确实是响应式的
        expect(isReactive(observedB)).toBe(true);
    })

    it("toRaw", () => {
        const original = { foo: 1 };
        const observed = reactive(original);

        expect(toRaw(observed)).toBe(original);

        expect(toRaw(original)).toBe(original);

        const wrapped = readonly(observed);
        expect(toRaw(wrapped)).toBe(original);
    })

})