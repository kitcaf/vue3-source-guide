import { ComponentInternalInstance, getCurrentInstance, setCurrentInstance } from "./component";

export const enum LifecycleHooks {
    BEFORE_MOUNT = "bm",
    MOUNTED = "m"
}

function injectHook(
    type: keyof ComponentInternalInstance,
    hook: Function,
    // 默认直接绑定到当前setup对应的组件
    target: ComponentInternalInstance = getCurrentInstance()
) {
    if (target) {
        const hooks: Function[] = target[type] || (target[type] = [])
        hooks.push(hook)
    }
    else {
        console.warn(`Function ${type} is called without current active component instance.`);
    }
}

//导出具体的api
export const onMounted = (hook: Function) => injectHook(LifecycleHooks.MOUNTED, hook)
export const onBeforeMount = (hook: Function) => injectHook(LifecycleHooks.BEFORE_MOUNT, hook)
