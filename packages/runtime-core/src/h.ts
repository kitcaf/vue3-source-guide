import { createVNode, vNodeType } from "./vnode";


export function h(
    type: vNodeType,
    props?: any,
    children?: string | any[] | null) {
    return createVNode(type, props, children)
}