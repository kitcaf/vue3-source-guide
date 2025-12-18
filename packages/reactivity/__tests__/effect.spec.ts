import { it, describe, expect } from "vitest"
import { reactive } from "../src/reactive";
import { effect } from "../src/effect";

const user = {
    name: "miniVue",
    get fullName() {
        // 当我们通过 Proxy 访问 fullName 时，这里的 this 是谁？
        console.log("正在读取 fullName，此时 this 是：", this);
        return "hello " + this.name;
    }
};

describe("effect test", () => {
    it("reactive getter target[key]测试", () => {
        const proxyUser = reactive(user)
        effect(() => {
            console.log("依赖更新 " + proxyUser.fullName)
        })
    })

    it("reactive", () => {
        const user = reactive({ age: 10 })
        let nextAge;
        effect(() => {
            nextAge = user.age + 1
        })
        // effect的初次执行
        expect(nextAge).toBe(11)

        //测试响应式
        user.age++
        expect(nextAge).toBe(12)
    })
})