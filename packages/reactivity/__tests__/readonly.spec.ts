import { it, describe, expect, vi } from "vitest"
import { reactive, readonly } from "../src/reactive";
import { effect } from "../src/effect";

describe("readonly", () => {
    it("init", () => {
        const original = { foo: 1 };
        const observed = readonly(original);
        expect(observed).not.toBe(original); //测试返回是否是一个proxy
    })

    it("should warn when call set and no track when get", () => {
        const user = readonly({ age: 10 });
        let nextAge
        let runner = effect(() => {
            nextAge = user.age
        })

        expect(nextAge).toBe(10)

        // 验证警告
        console.warn = vi.fn();  //把浏览器原生的 console.warn 偷梁换柱，换成了一个间谍函数
        //调用console.warn就会变成调用vi.fn()函数
        user.age++

        expect(console.warn).toBeCalled();

        expect(user.age).toBe(10)

    })

})