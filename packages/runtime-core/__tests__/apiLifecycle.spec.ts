import { describe, it, expect, vi } from "vitest";
import { createApp } from "../../runtime-dom/src";
import { h } from "../src/h";
import { onBeforeMount, onMounted } from "../src/apiLifecycle";

describe("api: lifecycle", () => {
    it("should call onBeforeMount and onMounted", () => {
        const hooks: string[] = [];

        const Comp = {
            setup() {
                onBeforeMount(() => {
                    hooks.push("beforeMount");
                });
                onMounted(() => {
                    hooks.push("mounted");
                });
                return {};
            },
            render() {
                return h("div", {}, "foo");
            },
        };

        const root = document.createElement("div");
        createApp(Comp).mount(root);

        // 验证执行了，且顺序正确
        expect(hooks).toEqual(["beforeMount", "mounted"]);
    });
});