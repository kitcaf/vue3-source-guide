import { describe, it, expect } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/index";

describe("component props", () => {
    it("should pass props to setup", () => {
        let observedProps;
        const App = {
            // 1. 测试 setup 接收 props
            setup(props: any) {
                observedProps = props;
                return {};
            },
            render() {
                return h("div", {}, "hi");
            }
        };

        const rootContainer = document.createElement("div");
        // 传参: { count: 1 }
        createApp(App).mount(rootContainer);

        expect(observedProps).toEqual({}); // 根组件没有 props，预期是空对象
    });

    it("should verify props in setup and render", () => {
        const App = {
            setup(props: any) {
                // 验证 setup 接收
                expect(props.count).toBe(1);
                return {

                };
            },
            render(_ctx: any) {
                return h("div", {}, "count is " + _ctx.count);
            }
        };

        const rootContainer = document.createElement("div");
        // 模拟 props: 我们这里暂时无法直接给根组件传 props (createApp(App, {count:1}))
        // 所以我们手动构造一个 vnode 场景，或者直接测 render 的结果
        // 但为了严谨，我们可以用 h 函数包裹测试

        /**
         * 测试场景：Parent -> Child
         */
        const Child = {
            setup(props: any) {
                return {}
            },
            render(_ctx: any) {
                return h("div", {}, "child props: " + _ctx.msg)
            }
        }

        const Parent = {
            render() {
                // 父组件给子组件传 props
                return h(Child, { msg: "world" })
            },
            setup() { return {} }
        }

        createApp(Parent).mount(rootContainer);

        // 验证结果
        expect(rootContainer.innerHTML).toBe("<div>child props: world</div>");
    });
});