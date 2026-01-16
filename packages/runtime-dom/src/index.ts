import { ComponentOptions } from "@mini-vue/runtime-core";
import { RendererOptions, createRenderer } from "@mini-vue/runtime-core";
import { createElement, createText, insert } from "./nodeOps";
import { patchProp } from "./patchProp";

// --- 组装渲染器 ---
export const rendererOptions: RendererOptions = {
    createElement,
    patchProp,
    insert,
    createText
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


