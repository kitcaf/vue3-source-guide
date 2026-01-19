import { describe, it, expect } from "vitest";
import { h } from "../src/h";
import { createApp } from "@mini-vue/runtime-dom";
import { provide, inject } from "../src/apiInject";

describe("api: inject", () => {
    it("should inject values from parent/ancestor", () => {
        // Provider (GrandParent)
        const Provider = {
            name: "Provider",
            setup() {
                provide("foo", "fooVal");
                provide("bar", "barVal");
            },
            render() {
                return h(Consumer);
            },
        };

        // Consumer (Parent) -> 验证中间层 provide 覆盖
        const Consumer = {
            name: "Consumer",
            setup() {
                provide("foo", "fooOverride");
                provide("baz", "bazVal");
                // 这里中间层也可以 inject
                const foo = inject("foo");
                return { foo };
            },
            render() {
                return h(DeepChild);
            },
        };

        // DeepChild (GrandChild) -> 验证跨层级和默认值
        const DeepChild = {
            name: "DeepChild",
            setup() {
                const foo = inject("foo"); // 应该拿到 Consumer 的 'fooOverride'
                const bar = inject("bar"); // 应该拿到 Provider 的 'barVal' (跨层级)
                const baz = inject("baz"); // 应该拿到 Consumer 的 'bazVal'
                const defaultVal = inject("fake", "default"); // 默认值
                const funcDefault = inject("fakeFn", () => "funcDefault"); // 函数默认值

                return {
                    foo,
                    bar,
                    baz,
                    defaultVal,
                    funcDefault,
                };
            },
            render(_ctx: any) {
                return h("div", {}, `${_ctx.foo}-${_ctx.bar}-${_ctx.baz}-${_ctx.defaultVal}-${_ctx.funcDefault}`);
            },
        };

        const root = document.createElement("div");
        createApp(Provider).mount(root);

        // 验证结果
        // foo: fooOverride (被中间层覆盖)
        // bar: barVal (来自最上层)
        // baz: bazVal (来自中间层)
        expect(root.innerHTML).toBe(
            `<div>fooOverride-barVal-bazVal-default-funcDefault</div>`
        );
    });
});