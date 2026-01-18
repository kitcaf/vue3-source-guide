import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
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

// 组件实例 (内部使用的组件对象)
export interface ComponentInternalInstance {
    // --- 核心属性 ---
    vnode: VNode; // 当前组件的 vnode
    type: ComponentOptions; // 组件实例对象
    // --- 状态相关 ---
    setupState: any;        // setup 的返回值-一般是一个对象
    proxy: any, // 代理对象
    props: any,
    // --- 内部方法（里面就是调用h方法 --- 返回组件的ui描述vnode） ---
    render: InternalRenderFunction | null;
}

export function createComponentInstance(vnode: VNode): ComponentInternalInstance {
    const instance: ComponentInternalInstance = {
        vnode,
        type: vnode.type as ComponentOptions,
        setupState: {},
        proxy: {},
        props: null,
        render: null
    }
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
    return instance
}

export function setupComponent(instance: ComponentInternalInstance) {
    //处理props
    initProps(instance, instance.vnode.props)
    // 执行setup - 记得传入props参数
    setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance: ComponentInternalInstance) {
    const Component = instance.type;
    const { setup } = Component

    if (setup) {
        const setupResult = setup(instance.props)
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
        instance.setupState = setupResult
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