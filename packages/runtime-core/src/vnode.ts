import { shapeFlags } from "packages/shared/src/shapeFlags"
import { Component } from "./component"

export type vNodeType = string | Component

export interface VNode {
    type: vNodeType,
    props: any, // 参数（透传）
    children: string | any[] | null,
    shapeFlag: number,
    el: HTMLElement | null

}

/**
 * createVNode
 * @param type // （不要认为只是一个字符串）组件对象 或 HTML 标签名 (如 'div')
 * @param props // 属性
 * @param children // 子节点
 */
export function createVNode(
    type: vNodeType,
    props?: any,
    children?: string | any[]
): VNode {
    const vnode: VNode = {
        type,
        props,
        children: children ?? null,
        shapeFlag: getShapeFlag(type),
        el: null // 将来挂载的真实节点,
    }

    // 叠加状态
    if (typeof children === "string") {
        vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN
    }
    return vnode
}

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? shapeFlags.ELEMENT
        : shapeFlags.STATEFUL_COMPONENT
}