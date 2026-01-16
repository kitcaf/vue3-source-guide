import { describe, expect, it, vi } from "vitest";
import { CanvasElement, renderer } from "../src/canvas_render"
import { h } from "@mini-vue/runtime-core";

describe("Custom Renderer: Canvas", () => {
    it("should render and draw canvas elements", () => {
        // 2. 定义 Canvas 根容器 (Root Stage)
        // 模拟一个舞台对象
        const stage: CanvasElement = {
            type: "ELEMENT",
            tag: "Stage",
            x: 0,
            y: 0,
            color: "white",
            children: [],
            draw: (ctx) => {
                // 舞台只需绘制所有孩子
                stage.children.forEach(c => c.draw(ctx));
            }
        };

        // 3. 定义 Vue 组件
        // 我们用 h 函数描述图形：一个红色的 rect，位置在 (10, 10)
        const App = {
            render() {
                return h("rect", { x: 10, y: 10, color: "red" });
            },
            setup() { return {} }
        };

        // 4. 执行挂载
        renderer.createApp(App).mount(stage);

        // --- 验证 1: 数据结构 ---
        expect(stage.children.length).toBe(1);
        const rect = stage.children[0] as CanvasElement;
        expect(rect.tag).toBe("rect");
        expect(rect.x).toBe(10);
        expect(rect.color).toBe("red");

        // --- 验证 2: 模拟绘制过程 ---
        // 我们不需要真实的 Canvas Context，用一个 Mock 对象即可
        const mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillStyle: "",
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn()
        };

        // 触发绘制
        stage.draw(mockCtx);

        // 断言绘制指令是否被正确调用
        expect(mockCtx.save).toHaveBeenCalled(); // 应该保存状态
        expect(mockCtx.fillStyle).toBe("red"); // 颜色应该是红色
        expect(mockCtx.fillRect).toHaveBeenCalledWith(10, 10, 50, 50); // 应该在正确位置绘制
        expect(mockCtx.restore).toHaveBeenCalled();
    });
});