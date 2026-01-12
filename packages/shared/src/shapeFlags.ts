export const enum shapeFlags {
    //001 HTML 元素
    ELEMENT = 1,
    //010(左移一位) 有状态组件 (平时写的普通组件)
    STATEFUL_COMPONENT = 1 << 1,
    //0100 子节点是纯文本（vnode.children）- 递归树等的判断
    TEXT_CHILDREN = 1 << 2,
    //01000 子节点是数组
    ARRAY_CHILDREN = 1 << 3
}