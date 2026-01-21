import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/h";
import { ref } from "../../reactivity/src/ref";

describe("element props update", () => {
    it("should update props (add, remove, change)", () => {
        const count = ref(0);

        const App = {
            setup() {
                return { count };
            },
            render(_ctx: any) {
                // 场景设计：
                // count = 0: { foo: "foo", bar: "bar" }
                // count = 1: { foo: "new-foo", baz: "baz" }
                // 预期变化：
                // foo: 修改 (foo -> new-foo)
                // bar: 删除 (bar -> undefined)
                // baz: 新增 (undefined -> baz)

                const props = _ctx.count === 0
                    ? { foo: "foo", bar: "bar" }
                    : { foo: "new-foo", baz: "baz" };

                return h("div", props, "hello");
            }
        };

        const root = document.createElement("div");
        createApp(App).mount(root);
        const el = root.firstChild as HTMLElement;

        // 1. 初始状态
        expect(el.getAttribute("foo")).toBe("foo");
        expect(el.getAttribute("bar")).toBe("bar");
        expect(el.getAttribute("baz")).toBe(null);

        // 2. 触发更新
        count.value++;

        // 3. 验证更新
        expect(el.getAttribute("foo")).toBe("new-foo"); // 修改
        expect(el.getAttribute("bar")).toBe(null);      // 删除
        expect(el.getAttribute("baz")).toBe("baz");     // 新增
    });
});