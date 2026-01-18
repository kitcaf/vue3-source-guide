import { describe, it, expect, vi } from "vitest";
import { createApp } from "@mini-vue/runtime-dom";
import { h } from "../src/h";

it("should trigger emit", () => {
    const onAdd = vi.fn();
    const onFooBar = vi.fn();

    const Child = {
        setup(props: any, { emit }: any) {
            emit("add", 1, 2);
            emit("foo-bar");
            return {};
        },
        render() {
            return h("div");
        },
    };

    const Parent = {
        render() {
            return h(Child, {
                onAdd,
                onFooBar,
            });
        },
    };

    const rootContainer = document.createElement("div");
    // 挂载父组件
    createApp(Parent).mount(rootContainer);

    expect(onAdd).toHaveBeenCalledWith(1, 2);
    expect(onFooBar).toHaveBeenCalled();
});