import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/h";
import { ref } from "../../reactivity/src/ref";

describe("element children update", () => {
    it("should switch between text and array children", () => {
        const isText = ref(true);
        const App = {
            setup() {
                return { isText };
            },
            render(_ctx: any) {
                return h(
                    "div",
                    {},
                    _ctx.isText
                        ? "text children"
                        : [h("div", {}, "A"), h("div", {}, "B")]
                );
            }
        };

        const root = document.createElement("div");
        createApp(App).mount(root);
        const el = root.firstChild as HTMLElement;

        // 1. 初始: Text
        expect(el.textContent).toBe("text children");

        // 2. Text -> Array
        isText.value = false;
        // 验证: 文本被清空，出现了两个子元素
        expect(el.textContent).not.toBe("text children");
        expect(el.children.length).toBe(2);
        expect(el.children[0].innerHTML).toBe("A");

        // 3. Array -> Text
        isText.value = true;
        // 验证: 子元素被移除，变回文本
        expect(el.textContent).toBe("text children");
        expect(el.children.length).toBe(0);
    });
});