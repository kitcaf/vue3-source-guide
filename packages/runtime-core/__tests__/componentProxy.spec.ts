import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src/index"; // 引入你已经做好的 runtime-dom
import { h } from "../src/index";

describe("component proxy", () => {
    it("should access setupState via this", () => {
        const App = {
            setup() {
                return {
                    msg: "hello proxy",
                };
            },
            render(_ctx: any) {
                // 通过 this.msg 访问 setupState
                return h("div", {}, _ctx.msg);
            },
        };

        const rootContainer = document.createElement("div");
        createApp(App).mount(rootContainer);

        // 验证文本渲染
        expect(rootContainer.innerHTML).toBe("<div>hello proxy</div>");
    });
});