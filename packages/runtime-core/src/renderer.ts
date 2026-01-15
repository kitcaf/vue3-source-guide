import { ShapeFlags } from "@mini-vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { type VNode } from "./vnode";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';

export interface RendererOptions {
    /**
     * 创建DOM方法
     */
    createElement(type: string): HTMLElement
    /**
     * 向DOM元素中插入属性方法
     */
    patchProp(el: HTMLElement, key: string, preValue: any, nextValue: any): void
    /**·
     * 向父元素插入子元素方法
     */
    insert(el: HTMLElement, parent: HTMLElement, anchor?: any): void
}

export function createRenderer(options: RendererOptions) {
    // 此时闭包的好处体现出来了
    // createRenderer被调用一次，在整个生命周期构建了一个独立的作用域
    // 里面的函数可以调用统一的一个options方法
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options

    // render: 渲染入口 调用 patch，处理挂载逻辑
    function render(vnode: VNode, container: HTMLElement) {
        patch(null, vnode, container)
    }

    //patch: 核心 Diff 算法入口
    // 作用：（1）挂载（2）更新
    // n1 旧VNode（虚拟节点树）- null 表示挂载
    // 表现形式上是节点但有children变量本质就是VNode树
    // n2 新VNode（虚拟节点树）
    // contianer 容器 - 就是挂载的div
    function patch(n1: VNode | null, n2: VNode, container: HTMLElement) {
        const { shapeFlag } = n2
        //挂载阶段
        if (!n1) {
            // 处理组件vNode
            if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(n1, n2, container)
            }
            // 处理Element vNode
            if (shapeFlag & ShapeFlags.ELEMENT) {
                if (!n1) mountElement(n2, container) // 挂载
            }
        }
    }

    function mountElement(vnode: VNode, container: HTMLElement) {
        // 创建真实DOM
        const el = hostCreateElement(vnode.type as string)
        vnode.el = el as HTMLElement

        const { shapeFlag, children } = vnode
        // 处理子节点
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children as string
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children as VNode[], el)
        }

        // 处理属性（初次挂载-preVal都是空的）
        const { props } = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }
        //插入到容器中
        hostInsert(el, container)
    }

    function mountChildren(children: VNode[], container: HTMLElement) {
        children.forEach(vnode => {
            patch(null, vnode, container)
        })
    }

    //  --- 组件处理流程 ---
    function processComponent(n1: VNode | null, n2: VNode, container: HTMLElement) {
        // 表示挂载
        if (!n1) mountComponent(n2, container)
    }

    function mountComponent(initialVNode: VNode, container: HTMLElement) {
        const instance = createComponentInstance(initialVNode)

        // 执行setup,此时instance.render已经被成功赋值了
        setupComponent(instance)

        // 此时就是要执行instance.render，描述组件ui
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(
        instance: ComponentInternalInstance,
        initialVNode: VNode,
        container: HTMLElement) {
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