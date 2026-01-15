import { describe, it, expect, vi } from "vitest";
import { createRenderer } from "../src/renderer";
import { h } from "../src/h";

const rendererOptions = {
    createElement(type: string) {
        return document.createElement(type);
    },
    patchProp(el: HTMLElement, key: string, prevVal: any, nextVal: any) {
        el.setAttribute(key, nextVal);
    },
    insert(el: HTMLElement, parent: HTMLElement) {
        parent.append(el);
    },
};

describe("component test", () => {
    it("should mount element with props and text children", () => {
        // --- 准备数据 ---
        // <div id="root" class="test">hi vue3</div>
        const vnode = h("div", { id: "root", class: "test" }, "hi vue3");

        // 为了驱动渲染，我们需要一个根组件来包裹这个 vnode，或者直接 render vnode
        // 这里我们用最简单的方式：创建一个 App 组件，render 返回上面的 vnode
        const App = {
            render() {
                return vnode;
            },
            setup() {
                return {};
            }
        };

        // --- 执行 ---
        const rootContainer = document.createElement("div");
        // 使用我们需要测试的 renderer
        const renderer = createRenderer(rendererOptions);
        renderer.createApp(App).mount(rootContainer);

        // --- 验证 ---
        const el = rootContainer.firstChild as HTMLElement;

        // 1. 验证标签类型
        expect(el.tagName).toBe("DIV");
        // 2. 验证 Props (patchProp 逻辑)
        expect(el.getAttribute("id")).toBe("root");
        expect(el.getAttribute("class")).toBe("test");
        // 3. 验证 Text Children
        expect(el.textContent).toBe("hi vue3");
    });

    it("should mount element with array children (recursive)", () => {
        // --- 准备数据 ---
        // <div>
        //   <p>child1</p>
        //   <span>child2</span>
        // </div>
        const vnode = h("div", { id: "parent" }, [
            h("p", { class: "child" }, "child1"),
            h("span", {}, "child2"),
        ]);

        const App = {
            render: () => vnode,
            setup: () => ({})
        };

        // --- 执行 ---
        const rootContainer = document.createElement("div");
        createRenderer(rendererOptions).createApp(App).mount(rootContainer);

        // --- 验证 ---
        const el = rootContainer.firstChild as HTMLElement;

        // 验证父节点
        expect(el.id).toBe("parent");

        // 验证子节点数量 (mountChildren 逻辑)
        expect(el.children.length).toBe(2);

        // 验证递归挂载的具体内容
        expect(el.children[0].tagName).toBe("P");
        expect(el.children[0].textContent).toBe("child1");

        expect(el.children[1].tagName).toBe("SPAN");
        expect(el.children[1].textContent).toBe("child2");
    });
});