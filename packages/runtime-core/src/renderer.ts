import { ShapeFlags } from "@mini-vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { Fragment, Text, type VNode } from "./vnode";
import { ComponentInternalInstance, createComponentInstance, setupComponent, Slot } from './component';
import { effect } from "@mini-vue/reactivity";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { queueJob } from "./scheduler";
import { unwatchFile } from "node:fs";

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

    // 作用：（1）挂载（2）更新
    // n1 旧VNode（虚拟节点树）- null 表示挂载
    // 表现形式上是节点但有children变量本质就是VNode树
    // n2 新VNode（虚拟节点树）
    // contianer 容器 - 就是挂载的div
    function patch(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null = null,
        anchor: RendererElement | null = null // 锚点
    ) {
        const { type, shapeFlag } = n2
        // 节点类型复用更新：
        // （1）如果节点不能复用，需要对这个节点及其子节点全部卸载
        // （2）如果节点可以复用，继续深入判断需要更新哪些内容，比如Element的属性、Text节点的内容...
        if (n1 && !isSameVNodeType(n1, n2)) {
            unmount(n1)
            n1 = null // 走挂载流程
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
                    processElement(n1, n2, container, parent)
                }
                break;
        }
    }

    function isSameVNodeType(n1: VNode | null, n2: VNode,) {
        return n1?.key === n2.key && n1?.type === n2.type
    }

    function unmount(vnode: VNode) {
        /**
         * 需要分情况讨论，Element、Component、Fragment、Text
         * （1）Fragment：它自己是没有DOM的，直接处理它的Children，某组件的render函数的根节点
         * （2）Component：执行组件卸载逻辑 (stop effect, 生命周期等)
         *  ... 
         */
        const { shapeFlag, type } = vnode;

        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
            unmountComponent(vnode.component!) // 里面会继续递归subTree
            return; // Component是没有DOM元素的，直接return
        }
        if (type === Fragment) {
            unmountChildren(vnode.children as VNode[])
            return; // 和Component同理
        }
        // 如果是Element，需要查一下children，如果是Array需要继续递归
        if (shapeFlag & ShapeFlags.ELEMENT && shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(vnode.children as VNode[]) // 这里就不要有return方法
        }

        // 子节点都递归判断完了，才进行销毁当前DOM元素
        hostRemove(vnode.el as HostElement); // DOM方法
    }

    function unmountComponent(instance: ComponentInternalInstance) {
        const { update, subTree } = instance;

        // 停止 effect 追踪
        if (update) {
            update.stop(); // 停止更新响应式系统里实现的
        }

        //递归销毁子树
        unmount(subTree!);

        // 其他生命周期函数 ... 等待实现
    }

    // 处理Fragment vNode节点（其实本质就是一个不渲染的div，包裹了组件的ui描述）
    function processFragment(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null,
        anchor = null // 锚点
    ) {
        if (n1 === null) { // 挂载操作
            mountChildren(n2.children as VNode[], container, parent)
        } else { // 更新流程  Fragment它的核心在children
            // 直接对比children
            patchChildren(n1, n2, container, parent!, anchor)
        }
    }

    // 处理Text vNode节点
    function processText(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        anchor = null // 锚点
    ) {
        if (!n1) { // 挂载
            const { children } = n2
            const textDom = (n2.el = hostCreateText(children as string)!)
            hostInsert(textDom, container)
        } else { // 更新 （没有孩子了不需要继续递归patch）
            const el = (n2.el = n1.el!) // 复用el，因为类型是一致的，只是里面的标签包含的内容不一致
            if (n1.children !== n2.children) {
                hostSetElementText(el as HostElement, n2.children as string)
            }
        }
    }

    function processElement(
        n1: VNode | null,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null,
        anchor = null // 锚点
    ) {
        if (!n1) { // 挂载 -- 这里需要补充parent参数防止inject/provide链断
            mountElement(n2, container, parent, anchor)
        }
        else { // 更新
            patchElement(n1, n2, container, parent, anchor)
        }
    }

    function patchElement(
        n1: VNode,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null,
        anchor = null // 锚点
    ) {
        // 将旧节点的真实 DOM 赋值给新节点
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ // 保证非空
        const newProps = n2.props || EMPTY_OBJ // 保存非空

        // 更新 Props 
        patchProps(el as HostElement, oldProps, newProps)

        // 更新 Children 
        // container是el，因为children和本身元素没有关系
        patchChildren(n1, n2, el as HostElement, parent, anchor)
    }

    function patchChildren(
        n1: VNode,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null,
        anchor: HostElement | null // 【新增】
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

        // children新节点是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 如果旧节点是文本
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 清除文本
                hostSetElementText(container, "")
                // 遍历所有的元素执行递归 - 挂载新的数组
                mountChildren(c2 as VNode[], container, parent)
            } else { // 旧节点是数组 新数组 vs 旧数组 diff算法
                //  预处理 - 双端对比 (Syncing) 核心diff算法
                patchKeyedChildren(c1 as VNode[], c2 as VNode[], container, parent, anchor)
            }
        }

    }

    /**
     * diff 算法核心文件
     * 也就是新数组与旧数组的对比
     */
    function patchKeyedChildren(
        c1: VNode[],  // 旧数组
        c2: VNode[], // 新数组
        container: HostElement,
        parentComponent: ComponentInternalInstance | null = null,
        parentAnchor: RendererElement | null = null // 父级锚点 解决 Fragment的元素漂移问题
    ) {
        // ### 预处理 双端对比 
        let i = 0
        const l2 = c2.length
        let e1 = c1.length - 1 // 旧数组尾指针
        let e2 = c2.length - 1 // 新数组尾指针

        // 1. 左端对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVNodeType(n1, n2)) { // 直接patch（对这个vNode进行patch - 继续去比较属性等不同）
                patch(n1, n2, container, parentComponent)
            } else {
                break; //遇到不同的直接break
            }
            i++
        }

        // 2. 右端对比 i 可以保持不用动的
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent)
            } else {
                break
            }
            e1--
            e2--
        }

        // ## 预处理 双端对比的两种特殊情况
        // （1）仅有新增 (New > Old)：只是新数组增加了元素（前插/后插）
        // （2）仅有删除 (Old > New)：新数组在旧数组中发现（前删/后删）
        if (i > e1) { // 旧数组走完了
            if (i <= e2) {  // 新数组还存在
                // 前插 / 后插
                // 这里就是核心计算anchor（往哪一个DOM元素中增加）
                // 这里的 nextPos 是新列表当前处理片段的后面一个元素
                const nextPos = e2 + 1 // DOM位置/null位置
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
                // while 循环中的anchor是不用变的，本质就是从前向后增加
                // [a] -> [a, b, c]: anchor是null，b，c依次push到队尾
                // [c] -> [a, b, c]: anchor是c，此时a，b依次加入到c前面，b形成了插队没有问题
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        }
        // 仅有删除
        else if (i > e2) { //新数组走完了
            // 前删和后删直接删除DOM就可以不用去处理anchor
            while (i <= e1) {
                hostRemove(c1[i].el as HostElement)
                i++
            }
        }
        else { // 处理中间乱序, LST的前期准备、LST、DOM处理
            // ## LST的前期准备
            // 核心构建一个转化序列：由新数组中每一个节点对应到旧数据的（索引位置 + 1）
            // 转化序列：表达了新数组每一个元素在旧数组的相对顺序位置
            // [a b c d] -> [b a c d g]。转化序列：[2, 1, 3, 4, 0] // 0表示新增
            // LST结果就是1 3 4（2 3 4也是选一个就可以）  a c d 就是最长上升序列

            // 1 构建新数组vnode -> index位置 映射表 {vnode, index}
            const s1 = i
            const s2 = i

            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const node = c2[i]
                keyToNewIndexMap.set(node.key, i)
            }

            // 2 转化序列 newIndexToOldIndexMap: 存储 [新节点相对索引] -> [旧节点索引 + 1]
            const toBePatched = e2 - s2 + 1; // 新列表元素数量
            let patched = 0;
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 默认新增
            // 标记是否需要移动
            let moved = false;
            let maxNewIndexSoFar = 0; // 记录目前遍历到的最大的新索引，用来检测是否需要移动（乱序）

            for (let i = s1; i <= e1; i++) {
                const prevNode = c1[i];

                // 优化
                if (patched >= toBePatched) { // 如果旧数组中的复用元素足够了就不需要处理了
                    hostRemove(prevNode.el as HostElement)
                    continue
                }

                // 找，通过key去是否可以复用
                let newIndex
                if (prevNode.key != null) {
                    newIndex = keyToNewIndexMap.get(prevNode.key)
                } else { // 如果没 key，只能尝试去一样类型的里面找
                    for (let j = s2; j <= e2; j++) {
                        // 同类型并且没有被选择过
                        if (isSameVNodeType(prevNode, c2[j]) && newIndexToOldIndexMap[j - s2] === 0) {
                            newIndex = j
                            break
                        }
                    }
                }

                if (newIndex == null) { // 不存在，不能复用那直接删除
                    hostRemove(prevNode.el as HostElement)
                }
                else { // 可以复用
                    // 不要越界 ，newIndexToOldIndexMap长短就是s2
                    newIndexToOldIndexMap[newIndex - s2] = i + 1 // + 1将0排除

                    // 还需要判断到底是否需要移动的情况
                    // 双端后：[B, C] -> [X, B, C, Y]？要移动吗？不用相对顺序正确
                    // 只需要在B前面插入X，在最后插入Y
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else { // 如果发现后来旧数组的元素在新数组的位置比maxNewIndexSoFar小乱序了
                        moved = true
                    }

                    // 更新复用元素
                    patch(prevNode, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }

            // LST
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []

            // DOM处理 核心对新数组从后往前遍历
            /**
             * 情况A：新增节点
             * 情况B：需要移动（复用节点）
             *      在LST中的序列的元素不用动
             *      不在就需要移动
             */
            let j = increasingNewIndexSequence.length - 1;

            // 对新数组从后开始遍历 （意味这本次遍历的上一个元素顺序是正确的）
            for (let i = toBePatched - 1; i >= 0; i--) {
                const index = i + s2; // 正确的index
                const cVnode = c2[index]

                const anchor = index + 1 < l2 ? c2[index + 1].el : parentAnchor

                // 新增节点
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, cVnode, container, parentComponent, anchor)
                }
                // 移动节点（主要要判断一下需要移动）
                else if (moved) {
                    // 不在, 因为increasingNewIndexSequence也是从后遍历
                    if (j < 0 || i != increasingNewIndexSequence[j]) {
                        // 不用patch了，因为在准备环节已经patch过来只需要移动就可以
                        // insertBefore 如果发现本身已经存在于当前文档的 DOM 树中
                        // 会自动先把它从原来的位置拔出来，然后再插入到新的位置
                        hostInsert(cVnode.el as HostNode, container, anchor)
                    } else {
                        j--
                    }
                }
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
        parent: ComponentInternalInstance | null,
        anchor = null // 锚点
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
        hostInsert(el, container, anchor)
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
        parent: ComponentInternalInstance | null,
        anchor = null // 锚点
    ) {
        // 表示挂载
        if (!n1) mountComponent(n2, container, parent)
        // 被动更新造成的组件更新
        else updateComponent(n1, n2, container, parent)
    }

    function updateComponent(
        n1: VNode,
        n2: VNode,
        container: HostElement,
        parent: ComponentInternalInstance | null
    ) {
        // 复用组件实例 【重要】
        const instance = (n2.component = n1?.component!)
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2 // 保存下一个状态的vNode
            queueJob(instance.update); // 执行组件更新操作，也是放入微队列中
        } else { // 不需要更新
            n2.el = n1?.el!
            instance.vnode = n2
        }
    }

    function shouldUpdateComponent(n1: VNode, n2: VNode) {
        const { props: prevProps } = n1;
        const { props: nextProps } = n2;

        // 简单实现，后期编辑器阶段辅助进行全量对比优化
        if (prevProps != nextProps) {
            return true
        }

        // 如果有插槽也是同理简单判断，后期会进行优化
        if (n2.children) {
            return true
        }
        return false
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
            } else { // 更新（主动更新）
                // 更新的流程还是不变的，只是被动更新需要对原组件实例进行属性赋值
                // 【新增】
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el // 先将之前vnode.el赋值给新vnode.el 起一个绑定作用
                    updateComponentPreRender(instance, next) // 属性赋值
                }

                // 保持不变
                const { proxy } = instance
                const prevSubTree = instance.subTree
                // 重新执行组件render
                const nextSubTree = (instance.subTree = instance.render!.call(proxy, proxy))
                patch(prevSubTree, nextSubTree, container, instance)
                instance.vnode.el = nextSubTree.el
            }
        }, {
            scheduler: () => {
                queueJob(instance.update) // 将组件的渲染函数重新输入就可以
            }
        })
        instance.update.id = instance.uid
    }

    function updateComponentPreRender(instance: ComponentInternalInstance, nextVNode: VNode) {
        // 被动更新：父组件只能影响props 和 children 
        // ### 先清空操作
        instance.next = null
        instance.vnode = nextVNode; // 这里一定要initSlots之前执行，因为initSlots会读instance.vnode

        // ## 再进行赋值操作 Props Children
        // [更新 Props] 这里可以调用initProps进行重新修改引用
        initProps(instance, nextVNode.props);
        // [更新 Children] 不能直接 instance.slots = nextVNode.children
        // 原因是必须和initSlots
        instance.slots = {} // 因为是更新将之前的全部清空
        initSlots(instance, nextVNode.children as Record<string, Slot>)
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