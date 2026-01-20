import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/h";
import { ref } from "../../reactivity/src/ref";

describe("component update", () => {
    it("should update view when data changes[when no patch methond]", () => {
        let renderCount = 0;
        const count = ref(0);
        const App = {
            setup() {
                return { count };
            },
            render(_ctx: any) {
                renderCount++; // 记录 render 执行次数
                return h("div", {}, String(_ctx.count));
            }
        };

        const root = document.createElement("div");
        createApp(App).mount(root);

        // 1. 初始挂载后，render 执行 1 次
        expect(renderCount).toBe(1);

        // 2. 修改响应式数据
        count.value++;

        // 3. 验证 render 是否再次执行（证明 effect 追踪成功）
        expect(renderCount).toBe(2);
    });
});