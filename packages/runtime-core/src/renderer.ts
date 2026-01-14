import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { createAppAPI } from "./apiCreateApp"
import { type VNode } from "./vnode";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';


export function createRenderer(option: any) {
    // render: 渲染入口 调用 patch，处理挂载逻辑
    function render(vnode: VNode, container: Element) {
        patch(null, vnode, container)
    }

    //patch: 核心 Diff 算法入口
    // 作用：（1）挂载（2）更新
    // n1 旧VNode（虚拟节点树）- null 表示挂载
    // 表现形式上是节点但有children变量本质就是VNode树
    // n2 新VNode（虚拟节点树）
    // contianer 容器 - 就是挂载的div
    function patch(n1: VNode | null, n2: VNode, container: Element) {
        const { shapeFlag } = n2
        console.log("Patch 逻辑被触发, 开始处理 VNode:", n2);
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(n1, n2, container)
        }
    }

    //  --- 组件处理流程 ---
    function processComponent(n1: VNode | null, n2: VNode, container: Element) {
        // 表示挂载
        if (n1 == null) mountComponent(n2, container)
    }

    function mountComponent(initialVNode: VNode, container: Element) {
        const instance = createComponentInstance(initialVNode)

        // 执行setup,此时instance.render已经被成功赋值了
        setupComponent(instance)

        // 此时就是要执行instance.render，描述组件ui
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(
        instance: ComponentInternalInstance,
        initialVNode: VNode,
        container: Element) {
        // 返回改组件的描述ui Vnode, 它本质也是vNode继续递归
        const subTreeVNode = instance.render!()

        // 继续递归
        patch(null, subTreeVNode, container)

        //当 vnode 是组件 (Component) 时， 指向该组件渲染出的子树根节点的el
        // 比如假设vnode.render(), 执行的是h('div', null, h(Bar-组件))
        // 也就是说上层递归会进入到element的判断, 然后初始化el = div真实DOM
        // vnode的el当然是应该subTreeVNode.el=<div></div>
        initialVNode.el = subTreeVNode.el
    }

    return {
        createApp: createAppAPI(render)
    }
}