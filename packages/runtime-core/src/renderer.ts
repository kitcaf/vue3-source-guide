import { ShapeFlags } from "@mini-vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { Fragment, Text, type VNode } from "./vnode";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';
import { effect } from "@mini-vue/reactivity";

/**
 * 最基础的单位。它可以是元素（div），也可以是纯文本（"hello"）
 */
export interface RendererNode {
    [key: string]: any
}
/**
 * (元素)：是节点的一种，但它更高级。它是“容器”
 * 从DOM世界来看，比如它有setAttribute、appendChild等方法
 * 因为渲染不一定是渲染到DOM，别的也需要考虑，因此这里设置的比较宽泛
 */
export interface RendererElement extends RendererNode {
}

export interface RendererOptions<
    HostNode = RendererNode,
    HostElement = RendererElement
> {
    /**
     * 创建DOM方法
     */
    createElement(type: string): HostElement
    /**
     * 向DOM元素中插入属性方法
     */
    patchProp(el: HostElement, key: string, preValue: any, nextValue: any): void
    /**·
     * 向父元素插入子元素方法
     */
    insert(el: HostNode, parent: HostElement, anchor?: any): void
    /**
     * 创建一个文本节点
     */
    createText(text: string): HostNode
    /**
     * 对元素设置文本
     */
    setElementText(node: HostElement, text: string): void
}

export function createRenderer<
    HostNode extends RendererNode,
    HostElement extends HostNode
>(options: RendererOptions<HostNode, HostElement>) {
    // 此时闭包的好处体现出来了
    // createRenderer被调用一次，在整个生命周期构建了一个独立的作用域
    // 里面的函数可以调用统一的一个options方法
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        createText: hostCreateText,
        setElementText: hostSetElementText
    } = options

    // render: 渲染入口 调用 patch，处理挂载逻辑
    function render(vnode: VNode, container: HostElement) {
        patch(null, vnode, container)
    }

    //patch: 核心 Diff 算法入口
    // 作用：（1）挂载（2）更新
    // n1 旧VNode（虚拟节点树）- null 表示挂载
    // 表现形式上是节点但有children变量本质就是VNode树
    // n2 新VNode（虚拟节点树）
    // contianer 容器 - 就是挂载的div
    function patch(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null = null) {
        const { type, shapeFlag } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container)
                break;
            case Text:
                processText(n1, n2, container)
                break
            default:
                // 处理组件vNode
                if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parent)
                }
                // 处理Element vNode
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    if (!n1) mountElement(n2, container) // 挂载
                }
                break;
        }
    }

    // 处理Fragment vNode节点（其实本质就是一个不渲染的div，包裹了组件的ui描述）
    function processFragment(n1: VNode | null, n2: VNode, container: HostElement) {
        // 那么就是说我不需要处理它本身代表的元素，直接处理它的孩子
        mountChildren(n2.children as VNode[], container)
    }

    // 处理Text vNode节点
    function processText(n1: VNode | null, n2: VNode, container: HostElement) {
        const { children } = n2
        const textDom = (n2.el = hostCreateText(children as string)!)
        hostInsert(textDom, container)
    }

    // 挂载Element vNode节点
    function mountElement(vnode: VNode, container: HostElement) {
        // 创建真实DOM
        const el = hostCreateElement(vnode.type as string)
        vnode.el = el

        const { shapeFlag, children } = vnode
        // 我的子节点就只有text，没有其他
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children as string)
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

    function mountChildren(children: VNode[], container: HostElement) {
        children.forEach(vnode => {
            patch(null, vnode, container)
        })
    }

    //  --- 组件处理流程 ---
    function processComponent(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        // 表示挂载
        if (!n1) mountComponent(n2, container, parent)
        else {
            // 
        }
    }

    function mountComponent(
        initialVNode: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        const instance = createComponentInstance(initialVNode, parent)

        // 执行setup,此时instance.render已经被成功赋值了
        setupComponent(instance)

        // 此时就是要执行instance.render，描述组件ui
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(
        instance: ComponentInternalInstance,
        initialVNode: VNode,
        container: HostElement) {

        effect(() => {
            if (!instance.isMounted) { // 挂载
                const { proxy, bm, m } = instance
                if (bm) {
                    invokeArrayFns(bm)
                }
                // 记得对instance.subTree赋值
                const subTreeVNode = (instance.subTree = instance.render!.call(proxy, proxy))

                patch(null, subTreeVNode, container, instance)

                initialVNode.el = subTreeVNode.el
                if (m) {
                    invokeArrayFns(m)
                }
            } else { // 更新
                const { proxy } = instance
                const oldSubTreeNode = instance.subTree
                // 重新执行组件render
                const newSubTreeVNode = (instance.subTree = instance.render!.call(proxy, proxy))
                patch(oldSubTreeNode, newSubTreeVNode, container, instance)

            }
        })
    }

    return {
        createApp: createAppAPI<HostElement>(render)
    }
}

// 辅助函数：遍历执行数组中的函数
function invokeArrayFns(fns: Function[]) {
    for (const fn of fns) {
        fn()
    }
}