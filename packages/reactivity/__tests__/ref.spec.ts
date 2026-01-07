import { describe, expect, it } from "vitest";
import { effect } from "../src/effect";
import { isRef, proxyRefs, ref, toRef, toRefs, unRef } from "../src/ref";
import { reactive } from "../src/reactive";

describe("ref", () => {
    it("reactive", () => {
        const a = ref(1);
        let dummy;
        let calls = 0;

        effect(() => {
            calls++;
            dummy = a.value;
        });

        // 1. 初始值
        expect(calls).toBe(1);
        expect(dummy).toBe(1);

        // 2. 修改值 -> 触发更新
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);

        // 3. 设置相同值 -> 不触发更新
        a.value = 2;
        expect(calls).toBe(2); // calls 应该还是 2
    });

    it("should make nested object reactive", () => {
        const a = ref({
            count: 1
        });
        let dummy;

        effect(() => {
            dummy = a.value.count;
        });

        expect(dummy).toBe(1);

        // 修改内部对象的属性，应该触发响应式
        // 这证明了 a.value 确实被转换成了 reactive 对象
        a.value.count = 2;
        expect(dummy).toBe(2);
    });

    it("isRef", () => {
        const a = ref(1);
        const user = reactive({ age: 1 });

        // 1. 验证 ref 是 true
        expect(isRef(a)).toBe(true);

        // 2. 验证普通值是 false
        expect(isRef(1)).toBe(false);

        // 虽然它们都是响应式的，但种类不同
        expect(isRef(user)).toBe(false);
    });

    it("unRef", () => {
        const a = ref(1);

        // 1. 如果传入 ref，返回 .value
        expect(unRef(a)).toBe(1);

        // 2. 如果传入普通值，原样返回
        expect(unRef(1)).toBe(1);
    });

    it("toRef： Reactive object and ref key", () => {
        const obj = reactive({
            foo: ref(1),
        });

        const refFoo = toRef(obj, "foo");

        // 1. 读 (Get)
        expect(refFoo.value).toBe(1);

        // 2. 写 (Set) - 应该更新内部的 ref
        refFoo.value = 2;
        expect(obj.foo).toBe(2); // 响应式对象自动拆包读取
        expect(refFoo.value).toBe(2);

        // 3. 验证响应式 (Reactivity)
        // 修改 refFoo 是否会触发 effect
        let dummy;
        effect(() => {
            dummy = refFoo.value;
        });
        expect(dummy).toBe(2);

        // 修改源对象，refFoo 应该也能感知
        obj.foo = 3;
        expect(dummy).toBe(3);
        expect(refFoo.value).toBe(3);
    });

    it("toRef： Reactive object and common key", () => {
        const obj = reactive({
            bar: 1,
        });

        const refBar = toRef(obj, "bar");

        expect(refBar.value).toBe(1);

        // 触发更新
        let dummy;
        effect(() => {
            dummy = refBar.value;
        });
        expect(dummy).toBe(1);

        // 修改 refBar -> 触发 else 分支 -> 修改 proxy -> 触发 trigger
        refBar.value = 2;
        expect(obj.bar).toBe(2);
        expect(dummy).toBe(2);
    });

    it("toRef： plain object and ref property", () => {
        const obj = reactive({
            bar: 1,
        });

        const refBar = toRef(obj, "bar");

        expect(refBar.value).toBe(1);

        // 触发更新
        let dummy;
        effect(() => {
            dummy = refBar.value;
        });
        expect(dummy).toBe(1);

        // 修改 refBar -> 触发 else 分支 -> 修改 proxy -> 触发 trigger
        refBar.value = 2;
        expect(obj.bar).toBe(2);
        expect(dummy).toBe(2);
    });

    it("toRefs", () => {
        const state = reactive({
            foo: 1,
            bar: 2,
        });

        const { foo, bar } = toRefs(state);

        expect(isRef(foo)).toBe(true);
        expect(isRef(bar)).toBe(true);
        expect(foo.value).toBe(1);
        expect(bar.value).toBe(2);

        // 修改 Ref -> 影响源对象
        foo.value++;
        expect(state.foo).toBe(2);

        // 修改源对象 -> 影响 Ref
        state.bar++;
        expect(bar.value).toBe(3);

        const plainObj = {
            ate: 1
        }

        const { ate } = toRefs(plainObj);
        expect(isRef(ate)).toBe(true);
        expect(ate.value).toBe(1);

    });
});

describe("proxyRefs", () => {
    it("should return value directly (get)", () => {
        const user = {
            age: ref(10),
            name: "xiaohong"
        };

        // 创建代理
        const proxyUser = proxyRefs(user);

        // 1. 验证 ref 属性不需要 .value 就能拿到值
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10); // 自动解包成功

        // 2. 验证普通属性原样返回
        expect(proxyUser.name).toBe("xiaohong");
    });

    it("should update ref value (set)", () => {
        const user = {
            age: ref(10),
            name: "xiaohong"
        };
        const proxyUser = proxyRefs(user);

        // 1. 设置新值（普通值）
        proxyUser.age = 20;

        // 2. 验证：
        // proxyUser.age 变了
        expect(proxyUser.age).toBe(20);
        // 【关键】原始的 ref.value 也应该跟着变！
        expect(user.age.value).toBe(20);

        // 3. 验证设置普通属性
        proxyUser.name = "xiaoming";
        expect(proxyUser.name).toBe("xiaoming");
        expect(user.name).toBe("xiaoming");

        //4. 修改ref属性（保护ref引用消失）
        proxyUser.age = 10 // 这个时候其实用户想的是修改ref中的.value
        expect(proxyUser.age).toBe(10)
    });
});