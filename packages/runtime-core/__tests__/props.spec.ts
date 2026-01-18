import { describe, it, expect, vi } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/index";
import { effect, isProxy, isReadonly, reactive } from "@mini-vue/reactivity";
import { initProps } from "../src/componentProps";

describe("component props", () => {
    it("should pass props to setup", () => {
        let observedProps;
        const App = {
            setup(props: any) {
                observedProps = props;
                return {};
            },
            render() {
                return h("div", {}, "hi");
            }
        };

        const rootContainer = document.createElement("div");
        createApp(App).mount(rootContainer);

        expect(observedProps).toEqual({});
    });

    it("should verify props in setup and render", () => {
        const App = {
            setup(props: any) {
                expect(props.count).toBe(1);
                return {};
            },
            render(_ctx: any) {
                return h("div", {}, "count is " + _ctx.count);
            }
        };

        const rootContainer = document.createElement("div");
        // 这里只是为了演示 setup 接收 props，实际根组件传参需要 createApp 第二个参数支持
        // 但目前我们主要测试父子组件传参，所以用下面的 Child/Parent 逻辑更严谨

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
                return h(Child, { msg: "world" })
            },
            setup() { return {} }
        }

        createApp(Parent).mount(rootContainer);
        expect(rootContainer.innerHTML).toBe("<div>child props: world</div>");
    });

    // --- 验证 shallowReadonly ---
    it("should make component props shallowReadonly", () => {
        const props = {
            foo: 1,
            bar: { baz: 2 }
        };

        const Child = {
            setup(props: any) {
                // 1. 修改第一层属性 (foo) -> 应该触发警告并失败
                props.foo = 2;
                expect(console.warn).toHaveBeenCalled();

                // 2. 修改深层属性 (bar.baz) -> 应该成功 (shallow)
                // 因为是 shallowReadonly，所以第二层是普通对象（或者原始响应式对象），可以修改
                props.bar.baz = 3;

                return {};
            },
            render() {
                return h("div", {}, "child");
            }
        };

        const Parent = {
            render() {
                return h(Child, props);
            },
            setup() { return {} }
        };

        // 劫持 console.warn
        console.warn = vi.fn();

        const rootContainer = document.createElement("div");
        createApp(Parent).mount(rootContainer);

        // 验证第一层没变 (readonly 生效)
        expect(props.foo).toBe(1);

        // 验证第二层变了 (shallow 生效)
        expect(props.bar.baz).toBe(3);
    });

    it("should be reactive and readonly (shallowReadonly)", () => {
        let observedProps: any;
        let dummy;

        const rawProps = reactive({ foo: 1 });

        const Child = {
            setup(p: any) {
                observedProps = p;
                // 2. 在子组件中使用 effect 追踪这个只读 props
                effect(() => {
                    // 当 p.foo 变化时，这里应该重新执行
                    dummy = p.foo;
                });
                return {};
            },
            render() {
                return h("div", {}, "child");
            }
        };

        // 模拟挂载过程，将 rawProps 传给 initProps
        const root = document.createElement("div");
        const instance = { vnode: { props: rawProps } } as any;
        initProps(instance, rawProps);

        // 执行 setup
        Child.setup(instance.props);

        // --- 验证 1: 初始状态 ---
        expect(dummy).toBe(1);
        expect(isReadonly(observedProps)).toBe(true);
        expect(isProxy(observedProps)).toBe(true);

        // --- 验证 2: 手动修改触发源 (模拟父组件更新数据) ---
        // 虽然 observedProps 是只读的，但它代理的是 rawProps。
        // 修改 rawProps 会触发依赖于 observedProps 的 effect。
        rawProps.foo = 2;
        expect(dummy).toBe(2); // 

        // --- 验证 3: 尝试直接修改 Props (应该失败) ---
        observedProps.foo = 3;
        // 因为是 readonly，修改不会生效
        expect(observedProps.foo).toBe(2);
        expect(dummy).toBe(2);
    });
});