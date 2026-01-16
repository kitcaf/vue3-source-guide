import { describe, it, expect } from "vitest";
import { createTextVNode, Fragment } from "../src/vnode";
import { h } from "../src/h";
import { createApp } from "@mini-vue/runtime-dom";

describe("renderer: fragment and text", () => {
    it("should support Fragment", () => {
        // 组件直接返回 Fragment
        const App = {
            render() {
                return h(Fragment, {}, [
                    h("div", {}, "A"),
                    h("div", {}, "B")
                ]);
            },
            setup() { return {} }
        };

        const root = document.createElement("div");
        createApp(App).mount(root);

        // 验证：root 下面应该直接是两个 div，没有其他包裹
        expect(root.children.length).toBe(2);
        expect(root.children[0].textContent).toBe("A");
        expect(root.children[1].textContent).toBe("B");
    });

    it("should support Text VNode", () => {
        // 混合使用 Element 和 Text
        const App = {
            render() {
                return h("div", {}, [
                    h("div", {}, "Box"),
                    createTextVNode("Pure Text") // 使用我们写的 helper
                ]);
            },
            setup() { return {} }
        };

        const root = document.createElement("div");
        createApp(App).mount(root);

        const el = root.firstChild;
        // 第一个是 div
        expect(el?.childNodes[0].textContent).toBe("Box");
        // 第二个是 TextNode (注意：TextNode 不在 children 集合里，在 childNodes 里)
        expect(el?.childNodes[1].textContent).toBe("Pure Text");
    });
});