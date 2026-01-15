// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { patchProp } from "../src/index"; // 确保路径指向你的 runtime-dom 入口

describe("runtime-dom: patchProp", () => {
    // --- 测试 1: 普通属性 ---
    it("should patch attributes", () => {
        const el = document.createElement("div");

        // 1. 新增属性 (Add)
        patchProp(el, "id", null, "foo");
        expect(el.id).toBe("foo");

        patchProp(el, "foo", null, "bar");
        expect(el.getAttribute("foo")).toBe("bar");

        // 2. 更新属性 (Update)
        patchProp(el, "id", "foo", "baz");
        expect(el.id).toBe("baz");

        // 3. 删除属性 (Remove)
        patchProp(el, "id", "baz", null);
        expect(el.hasAttribute("id")).toBe(false);
    });

    // --- 测试 2: 事件处理 (Invoker 机制) ---
    it("should patch event listeners (Invoker mechanism)", () => {
        const el = document.createElement("div");

        // 模拟两个不同的回调函数
        const fn1 = vi.fn();
        const fn2 = vi.fn();

        // 1. 首次绑定 (Mount)
        patchProp(el, "onClick", null, fn1);

        // 模拟点击
        el.click();
        expect(fn1).toHaveBeenCalled();

        // 验证内部是否生成了 _vei (Vue Event Invokers)
        // @ts-ignore: _vei 是内部属性，测试时忽略 TS 检查
        expect(el._vei).toBeDefined();
        // @ts-ignore
        expect(el._vei.click).toBeDefined();

        // 2. 更新事件 (Update) - 核心测试点！
        // 这里的重点是：我们没有 remove fn1 再 add fn2
        // 而是直接修改了 invoker.value
        patchProp(el, "onClick", fn1, fn2);

        el.click();
        // fn1 不应该再被调用 (因为 value 换了)
        expect(fn1).toHaveBeenCalledTimes(1); // 保持之前的 1 次
        // fn2 应该被调用
        expect(fn2).toHaveBeenCalled();

        // 3. 移除事件 (Unmount)
        patchProp(el, "onClick", fn2, null);

        el.click();
        // fn2 不应该再增加调用次数
        expect(fn2).toHaveBeenCalledTimes(1);

        // 验证 _vei 里的缓存被清理了
        // @ts-ignore
        expect(el._vei.click).toBeUndefined();
    });

    // --- 进阶测试: 验证 addEventListener 是否只调用了一次 ---
    it("should optimize event registration (addEventListener called once)", () => {
        const el = document.createElement("div");

        // 监控 el.addEventListener
        // 这里的 spy 必须在 patchProp 之前建立
        const addSpy = vi.spyOn(el, "addEventListener");
        const removeSpy = vi.spyOn(el, "removeEventListener");

        const fn1 = () => { };
        const fn2 = () => { };

        // 1. 第一次绑定 -> 应该调用 addEventListener
        patchProp(el, "onClick", null, fn1);
        expect(addSpy).toHaveBeenCalledTimes(1);

        // 2. 更新事件 -> 不应该调用 addEventListener，也不应该调用 removeEventListener
        // 这证明了 Invoker 机制生效了（只改了 value，没动 DOM）
        patchProp(el, "onClick", fn1, fn2);

        expect(addSpy).toHaveBeenCalledTimes(1); // 次数依然是 1
        expect(removeSpy).toHaveBeenCalledTimes(0); // 没有移除操作

        // 3. 移除事件 -> 应该调用 removeEventListener
        patchProp(el, "onClick", fn2, null);
        expect(removeSpy).toHaveBeenCalledTimes(1);
    });
});