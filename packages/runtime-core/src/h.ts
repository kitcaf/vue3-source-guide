import { createVNode, VNodeChildren, vNodeType } from "./vnode";


export function h(
    type: vNodeType,
    props?: any,
    children?: VNodeChildren) {
    return createVNode(type, props, children)
}