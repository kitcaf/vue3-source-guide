import { ShapeFlags } from "@mini-vue/shared"
import { ComponentOptions, Slot } from "./component"
import { RendererElement, RendererNode } from "./renderer"

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export type vNodeType = string
    | ComponentOptions
    | typeof Fragment
    | typeof Text

export type VNodeChildren =
    | string
    | any[]
    | VNode
    | VNode[]
    | Record<string, Slot> // ✨ 必须加这一行
    | null;

export interface VNode {
    type: vNodeType,
    props: any, // 参数（透传）
    children: VNodeChildren,
    shapeFlag: number,
    el: RendererNode | null
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
    children?: VNodeChildren
): VNode {
    const vnode: VNode = {
        type,
        props,
        children: children ?? null,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    // 叠加状态
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    // 判断slots，是组件然后它的children是对象
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof vnode.children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }

    // 判断子节点是否是插槽
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