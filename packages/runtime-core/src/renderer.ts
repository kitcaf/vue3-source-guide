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
    setElementText(node: HostElement, text: string): void,
    /**
     * 移除某个元素
     */
    remove(el: HostElement): void
}

const EMPTY_OBJ = {}

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
        setElementText: hostSetElementText,
        remove: hostRemove
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
        // 更新：如果节点没有复用，需要对这个节点及其子节点全部卸载
        if (n1 && n1.type !== n2.type) {
            unmount(n1); // 执行销毁
            n1 = null;   // 强制走挂载流程
        }
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent)
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
                    processElement(n1, n2, container, parent) // 挂载
                }
                break;
        }
    }

    function unmount(vnode: VNode) {
        /**
         * 需要分情况讨论，Element、Component
         * 主要原因是Component是存在监听事件的，并且是会被通知更新的，一定要消耗组件实例
         * 还有就是一些生命周期函数比如unmounted等函数
         * 防止内存泄露
         */
        const { shapeFlag, el, children } = vnode;

        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
            unmountComponent(vnode.component!)
        } else { // 元素
            hostRemove(vnode.el as HostElement)
        }
    }

    function unmountComponent(instance: ComponentInternalInstance) {

        const { update, subTree } = instance;

        // 停止 effect 追踪
        if (update) {
            update.stop(); // 停止更新响应式系统里实现的
        }

        //递归销毁子树
        unmount(subTree!);

        // 生命周期函数 ... 等待实现
    }

    // 处理Fragment vNode节点（其实本质就是一个不渲染的div，包裹了组件的ui描述）
    function processFragment(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        // 那么就是说我不需要处理它本身代表的元素，直接处理它的孩子
        mountChildren(n2.children as VNode[], container, parent)
    }

    // 处理Text vNode节点
    function processText(n1: VNode | null, n2: VNode, container: HostElement) {
        const { children } = n2
        const textDom = (n2.el = hostCreateText(children as string)!)
        hostInsert(textDom, container)
    }

    function processElement(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        if (!n1) { // 挂载 -- 这里需要补充parent参数防止inject/provide链断
            mountElement(n2, container, parent)
        }
        else { // 更新
            patchElement(n1, n2, container, parent)
        }
    }

    function patchElement(
        n1: VNode,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        // 将旧节点的真实 DOM 赋值给新节点
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ // 保证非空
        const newProps = n2.props || EMPTY_OBJ // 保存非空

        // 更新 Props （下一节）
        patchProps(el as HostElement, oldProps, newProps)

        // 更新 Children （下一节）
        // container是el，因为children和本身元素没有关系
        patchChildren(n1, n2, el as HostElement, parent)
    }

    function patchChildren(
        n1: VNode,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        const { shapeFlag: prevShapeFlag } = n1; // 旧
        const c1 = n1.children
        const { shapeFlag } = n2 // 新
        const c2 = n2.children

        // 新节点是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧是数组
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1 as VNode[])
            }

            // 旧是文本【设置新文本】 - 因为无论如何都是要设置新文本的
            if (c1 != c2) { // 修改这个元素
                hostSetElementText(container, c2 as string)
            }
        }

        // 新节点是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 如果旧节点是文本
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 清除文本
                hostSetElementText(container, "")
                // 遍历所有的元素执行递归 - 挂载新的数组
                mountChildren(c2 as VNode[], container, parent)
            } else { // 旧节点是数组
                console.log("diff 算法")
            }
        }

    }

    function unmountChildren(children: VNode[]) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el as HostElement);
        }
    }

    function patchProps(el: HostElement, oldProps: any, newProps: any) {
        if (oldProps != newProps) {
            //循环newProps 对象 【判断新增/修改】
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]

                if (prevProp != nextProp) {
                    // 在3.2.8节已经实现了对应的DOM方法
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            //循环oldProps
            if (oldProps != EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) { // key都不存在newProps，说明是删除
                        hostPatchProp(el, key, null, null); //删除属性语法
                    }
                }
            }

        }
    }

    // 挂载Element vNode节点
    function mountElement(
        vnode: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        // 创建真实DOM
        const el = hostCreateElement(vnode.type as string)
        vnode.el = el

        const { shapeFlag, children } = vnode
        // 我的子节点就只有text，没有其他
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children as string)
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children as VNode[], el, parent)
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

    function mountChildren(
        children: VNode[],
        container: HostElement,
        parent: ComponentInternalInstance | null) {
        children.forEach(vnode => {
            patch(null, vnode, container, parent)
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

        instance.update = effect(() => {
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

                instance.isMounted = true
            } else { // 更新
                const { proxy } = instance
                const prevSubTree = instance.subTree
                // 重新执行组件render
                const nextSubTree = (instance.subTree = instance.render!.call(proxy, proxy))
                patch(prevSubTree, nextSubTree, container, instance)

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