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

    // 测试用例 2: 被动更新 - Slots 改变
    it("should update component slots", () => {
        // 子组件：渲染插槽
        const Child = {
            name: "Child",
            render(_ctx: any) {
                // 简单模拟 renderSlot，假设你实现了 renderSlot 或者手动调用
                // h("div", {}, this.$slots.default())
                const slot = _ctx.$slots.default;
                return h("div", {}, slot ? slot() : []);
            }
        };

        const count = ref(1);

        // 父组件
        const Parent = {
            name: "Parent",
            render() {
                return h(Child, {}, {
                    // 插槽内容依赖父组件数据
                    default: () => h("p", {}, "count: " + count.value)
                })
            }
        };

        const root = document.createElement("div");
        createApp(Parent).mount(root);

        // 1. 初始挂载
        expect(root.innerHTML).toBe("<div><p>count: 1</p></div>");

        // 2. 更新数据
        count.value = 2;

        // 3. 断言插槽内容更新
        // 这验证了 updateComponentPreRender 中 initSlots 的逻辑是否正确
        expect(root.innerHTML).toBe("<div><p>count: 2</p></div>");
    });

    // 根节点变化 (验证 next.el 和 instance.vnode.el 的同步逻辑)
    it("should update instance.vnode.el when component root element changes", () => {
        const change = ref(false);

        // 子组件：根据状态切换根标签 div -> p
        const Child = {
            name: "Child",
            render() {
                return change.value
                    ? h("p", {}, "new root")
                    : h("div", {}, "old root");
            }
        };

        const Parent = {
            name: "Parent",
            render() {
                return h(Child);
            }
        };

        const root = document.createElement("div");
        createApp(Parent).mount(root);

        expect(root.innerHTML).toBe("<div>old root</div>");

        // 触发更新
        change.value = true;

        // 此时 Child 组件内部发生 patch，oldVnode(div) 被卸载，newVnode(p) 被挂载
        // 我们需要验证视图是否正确
        expect(root.innerHTML).toBe("<p>new root</p>");

        // 再次触发更新，验证下一次更新是否能找到正确的锚点
        // 如果 instance.vnode.el 没有正确更新，下一次 diff 可能会报错或找不到 parentNode
        change.value = false;
        expect(root.innerHTML).toBe("<div>old root</div>");
    });
});