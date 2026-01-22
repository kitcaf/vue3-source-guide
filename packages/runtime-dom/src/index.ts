import { ComponentOptions } from "@mini-vue/runtime-core";
import { RendererOptions, createRenderer } from "@mini-vue/runtime-core";
import { createElement, createText, insert, remove, setElementText } from "./nodeOps";
import { patchProp } from "./patchProp";

// --- 组装渲染器 ---
// 此时传入的两个类型就是DOM世界的类型
export const rendererOptions: RendererOptions<Node, Element> = {
    createElement,
    patchProp,
    insert,
    createText,
    setElementText,
    remove
}

// 导出基于 DOM 的 createApp
export function createApp(rootComponent: ComponentOptions) {
    // 调用 core 的 createRenderer，传入 DOM 特有的 API
    const renderer = createRenderer(rendererOptions);

    // 返回 mount 方法
    return renderer.createApp(rootComponent);
}

export * from "@mini-vue/runtime-core"
export * from "./nodeOps"
export * from "./patchProp"


