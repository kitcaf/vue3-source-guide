import { shapeFlags } from "packages/shared/src/shapeFlags"


/**
 * createVNode
 * @param type // 组件对象类型 或 HTML 标签名 (如 'div')
 * @param props // 属性
 * @param children // 子节点
 */
export function createVNode(type: any, props?: any, children?: any) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null // 将来挂载的真实节点,
    }

    // 叠加状态
    if (typeof children === "string") {
        vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.children |= shapeFlags.ARRAY_CHILDREN
    }
    return vnode
}

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? shapeFlags.ELEMENT
        : shapeFlags.STATEFUL_COMPONENT
}