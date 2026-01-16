import { ShapeFlags } from "@mini-vue/shared"
import { ComponentOptions } from "./component"

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export type vNodeType = string
    | ComponentOptions
    | typeof Fragment
    | typeof Text

export interface VNode {
    type: vNodeType,
    props: any, // 参数（透传）
    children: string | any[] | null,
    shapeFlag: number,
    el: HTMLElement | Text | null

}

/**
 * createVNode
 * @param type //（不要认为只是一个字符串）组件对象 或 HTML 标签名 (如 'div')
 * @param props // 属性
 * @param children // 子节点（可以是HTML元素也可以是组件）
 */
export function createVNode(
    type: vNodeType,
    props?: any,
    children?: string | any[] | null
): VNode {
    const vnode: VNode = {
        type,
        props,
        children: children ?? null,
        shapeFlag: getShapeFlag(type),
        el: null //
    }

    // 叠加状态
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }
    return vnode
}

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}

// 这个只是为了方便调用（只是为了（方便编译器使用））
export function createTextVNode(text: string) {
    return createVNode(Text, {}, text);
}