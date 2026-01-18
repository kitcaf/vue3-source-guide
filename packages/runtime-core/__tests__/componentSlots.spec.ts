import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/h";
import { renderSlot } from "../src/renderSlots";
import { createTextVNode } from "../src/vnode";

describe("component slots", () => {
    it("should render slots", () => {
        const App = {
            name: "App",
            render() {
                const app = h("div", {}, "App");
                // 传入 slots 对象: key 是插槽名, value 是返回 vnode 的函数
                const foo = h(
                    Foo,
                    {},
                    {
                        header: ({ age }: any) => [
                            h("p", {}, "header" + age),
                            createTextVNode("你好")
                        ],
                        footer: () => h("p", {}, "footer"),
                    }
                );
                return h("div", {}, [app, foo]);
            },
            setup() {
                return {};
            },
        };

        const Foo = {
            name: "Foo",
            setup() {
                return {};
            },
            render(_ctx: any) {
                const foo = h("p", {}, "foo");

                // 2. 渲染插槽
                // renderSlot(slots, name, props)
                const age = 18;
                return h("div", {}, [
                    // 渲染 header 插槽，并传入 age (作用域插槽)
                    renderSlot(_ctx.$slots, "header", { age }),
                    foo,
                    // 渲染 footer 插槽
                    renderSlot(_ctx.$slots, "footer"),
                ]);
            },
        };

        const rootContainer = document.createElement("div");
        createApp(App).mount(rootContainer);

        // 验证结果
        // 结构应该是:
        // <div>
        //   <div>App</div>
        //   <div>
        //     <p>header18</p>你好  <-- header 插槽
        //     <p>foo</p>          <-- 组件自身内容
        //     <p>footer</p>       <-- footer 插槽
        //   </div>
        // </div>

        // 我们检查关键内容是否渲染出来
        expect(rootContainer.innerHTML).toContain("header18");
        expect(rootContainer.innerHTML).toContain("footer");
        expect(rootContainer.innerHTML).toContain("你好");
    });
});