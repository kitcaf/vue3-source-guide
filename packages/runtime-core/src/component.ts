import { proxyRefs } from "@mini-vue/reactivity";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { type VNode } from "./vnode";

//render的类型，InternalRenderFunction = () => VNode;也可以
//但是因为render函数还会挂载一些额外的属性
//因此render函数就写成它的对象形式
export interface InternalRenderFunction {
    // 有的时候还有ctx参数，返回必须是 VNode
    (ctx?: any): VNode
}

// 组件配置 (即用户写的对象: { setup, render, ... } - 别Complier转换后的)
export interface ComponentOptions {
    //组件的render
    render?: InternalRenderFunction,
    // vue模板中script脚本中的返回的setup(或者语法糖) - 是一定要执行的
    setup?: (props?: any, ctx?: any) => any,
    //允许其他类型
    [key: string]: any,
}

export type Slot = (props: any) => VNode[] | VNode;

// 组件实例 (内部使用的组件对象)
export interface ComponentInternalInstance {
    // --- 核心属性 ---
    vnode: VNode; // 当前组件的 vnode
    type: ComponentOptions; // 组件实例对象
    // --- 状态相关 ---
    setupState: any;        // setup 的返回值-一般是一个对象
    proxy: any, // 代理对象
    props: any,
    slots: Record<string, Slot>
    parent: ComponentInternalInstance | null, // 只指向父组件实例
    provides: Record<string, object>,
    isMounted: Boolean, // 组件是否挂载
    subTree: VNode | null,
    // --- 内部方法（里面就是调用h方法 --- 返回组件的ui描述vnode） ---
    render: InternalRenderFunction | null;
    emit: (...args: any) => void,
    // --- 生命周期相关 ---
    bm: Function[] | null, // onBeforeMounted
    m: Function[] | null, // onMounted
}

let currentInstance: ComponentInternalInstance | null = null

export function getCurrentInstance() {
    return currentInstance!;
}

export function setCurrentInstance(instance: ComponentInternalInstance | null) {
    currentInstance = instance;
}

export function createComponentInstance(
    vnode: VNode,
    parent: ComponentInternalInstance | null): ComponentInternalInstance {
    const instance: ComponentInternalInstance = {
        vnode,
        type: vnode.type as ComponentOptions,
        setupState: {},
        proxy: {},
        props: null,
        slots: {},
        parent: parent,
        isMounted: false,
        subTree: null,
        // 初始化App.vue的parent一定是null, 需要初始化为{} (Object.create(null))
        // 其他组件都是parent.privides
        provides: parent ? parent.provides : Object.create(null),
        render: null,
        emit: () => { },
        bm: null,
        m: null
    }
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
    //将 emit 函数绑定到当前 instance 上, 只要调用instance.emit()
    // 通过bind此时它的第一个参数默认就是instance
    // 不需要自己处理emit(instance, event, ...) 这样调用
    // 直接就是emit(event)调用
    instance.emit = emit.bind(null, instance)
    return instance
}

export function setupComponent(instance: ComponentInternalInstance) {
    //处理props
    initProps(instance, instance.vnode.props)
    //处理slots
    initSlots(instance, instance.vnode.children as Record<string, Slot>)
    // 执行setup - 记得传入props参数
    setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance: ComponentInternalInstance) {
    const Component = instance.type;
    const { setup } = Component

    if (setup) {
        // 在调用 setup 之前，设置全局变量
        setCurrentInstance(instance)
        const setupResult = setup(instance.props, {
            emit: instance.emit
        })
        // 执行完毕后，重置全局变量
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    } else {
        finishComponentSetup(instance)
    }
}

/**
 * 
 * @param instance 
 * @param setupResult 
 */
export function handleSetupResult(instance: ComponentInternalInstance, setupResult: any) {
    // setup 可能返回对象 (State) 
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }
    // 第二类组件render函数
    else if (typeof setupResult === 'function') {
        instance.render = setupResult
    }
    finishComponentSetup(instance)
}

export function finishComponentSetup(instance: ComponentInternalInstance) {
    const Component = instance.type;

    // 如果 instance 上还没有 render，赋值 Component 里的 render
    if (!instance.render) {
        instance.render = Component.render ?? null;
    }
}