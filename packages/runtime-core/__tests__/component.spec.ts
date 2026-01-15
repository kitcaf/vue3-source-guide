import { describe, it, expect, vi } from "vitest";
import { createRenderer } from "../src/renderer";
import { h } from "../src/h";

describe("component initialization", () => {
    it("should execute setup and render", () => {
        // 1. 监控 setup 和 render
        const setupSpy = vi.fn(() => ({ msg: "hello" }));
        const renderSpy = vi.fn(() => h("div")); // 返回一个 Element 类型的 VNode

        // 模拟一个组件
        const rootAppComponent = {
            setup: setupSpy,
            render: renderSpy,

        };

        // 2. 监控 console.log，看看最后是不是跑到了 "处理 Element" 的分支
        const logSpy = vi.spyOn(console, "log");

        // 3. 运行
        createRenderer({}).createApp(rootAppComponent).mount(document.createElement("div"));

        // 4. 验证
        expect(setupSpy).toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();
        // 关键验证：render 返回的 h('div') 触发了 patch 的 ELEMENT 分支
        expect(logSpy).toHaveBeenCalledWith("处理 Element");
    });
});