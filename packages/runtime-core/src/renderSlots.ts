import { Slot } from "./component";
import { createVNode, Fragment } from "./vnode";


export function renderSlot(
    slots: Record<string, Slot>,
    name: string,
    props?: any) {
    const slot = slots[name]
    if (slot) {
        // 创建Fragement包裹slot节点
        return createVNode(Fragment, {}, slot(props))
    }
}