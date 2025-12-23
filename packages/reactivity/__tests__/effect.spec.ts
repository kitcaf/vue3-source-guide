import { it, describe, expect, vi } from "vitest"
import { isReactive, isReadonly, reactive, readonly } from "../src/reactive";
import { effect, stop } from "../src/effect";

const user = {
    name: "miniVue",
    get fullName() {
        // 当我们通过 Proxy 访问 fullName 时，这里的 this 是谁？
        // console.log("正在读取 fullName，此时 this 是：", this);
        return "hello " + this.name;
    }
};

describe("effect test", () => {
    it("reactive getter target[key]测试", () => {
        const proxyUser = reactive(user)
        effect(() => {
            // console.log("依赖更新 " + proxyUser.fullName)
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

    it("reactive stop", () => {
        const user = reactive({ age: 10 })
        let nextAge;
        const runner = effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        stop(runner)
        user.age++
        expect(nextAge).toBe(11)
    })

    it("general loop-dead", () => {
        const user = reactive({ age: 10 })
        const runner = effect(() => {
            user.age++
        })
        expect(user.age).toBe(11)
        user.age++
        expect(user.age).toBe(13) // 自己执行了一次++，effect也执行了一次++
    })

    it("array loop-dead", () => {
        const list = reactive([])
        const runner = effect(() => {
            list.push(1)
        })
        expect(list).toStrictEqual([1])
        list.push(2)
        expect(list).toStrictEqual([1, 2, 1])
    })

    it("reactivate scheduler", () => {
        const user = reactive({ age: 10 })
        let nextAge;
        let run: any

        const scheduler = vi.fn(() => {
            run = runner;
        })

        let runner = effect(() => {
            nextAge = user.age
        }, { scheduler: scheduler })

        expect(nextAge).toBe(10)
        expect(scheduler).toBeCalledTimes(0) //被调用0次

        user.age++ //应该副作用函数不调用，scheduler执行一次

        expect(nextAge).toBe(10)
        expect(scheduler).toBeCalledTimes(1)

    })

    // 深层嵌套 - 测试（无缓存）
    it("nested reactive", () => {
        const user = reactive({
            lihua: {
                age: 10
            },
            array: [{ bar: 2 }]
        })

        const readOnlyUser = readonly({
            lihua: {
                age: 10
            }

        })
        let nextAge, nextbar;
        effect(() => {
            nextAge = user.lihua.age
            nextbar = user.array[0].bar
        })
        expect(isReactive(user.lihua)).toBe(true);
        expect(isReactive(user.array)).toBe(true);
        expect(isReactive(user.array[0])).toBe(true);
        expect(isReadonly(readOnlyUser.lihua)).toBe(true)
        expect(nextAge).toBe(10)
        expect(nextbar).toBe(2)
        user.lihua.age++
        user.array[0].bar++
        expect(nextAge).toBe(11)
        expect(nextbar).toBe(3)

    })
})