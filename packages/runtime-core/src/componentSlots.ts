import { ShapeFlags } from "@mini-vue/shared";
import { ComponentInternalInstance, Slot } from "./component";
import { VNode } from "./vnode";

/**
 * 将父组件渲染函数中的slots部分的children挂载到对应的子组件实例slots
 * @param instance 
 * @param children 
 */
export function initSlots(
    instance: ComponentInternalInstance,
    children: Record<string, Slot>) {
    const { slots, vnode } = instance

    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, slots)
    }
}

function normalizeObjectSlots(
    children: Record<string, Slot>,
    slots: Record<string, Slot>) {
    for (const key in children) {
        const value = children[key]
        // 保证一定是slots[key] 执行的返回结果一定VNode[]
        // 因为用户可能手写render函数（不使用complier）直接返回一个 h() 得到的对象，而不是数组
        slots[key] = (props: any) => normalizeSlotValue(value(props));
    }
}

function normalizeSlotValue(value: VNode[] | VNode) {
    return Array.isArray(value) ? value : [value]
}