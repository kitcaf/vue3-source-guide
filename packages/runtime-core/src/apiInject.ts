import { ComponentInternalInstance, getCurrentInstance } from "./component";

/**
 * 组件setup中可以执行的provide函数
 * @param key 
 * @param val 
 */
export function provide(key: string, val: Object) {
    // 因为provide是在setup中执行的，可以通过全局获取组件实例
    const currentInstance: ComponentInternalInstance = getCurrentInstance()

    if (currentInstance) {
        // 第一次的时候它是一切父组件累计的一个对象
        let { provides } = currentInstance
        // 多次provide只执行一次
        if (provides === currentInstance.parent?.provides) {
            currentInstance.provides = Object.create(provides)
        }
        // 这里一定要写currentInstance.provides，不能写provides
        // 除非在if (provides === currentInstance.parent?.provides) { 重新赋值
        // 因为目前的provides有可能是不等于currentInstance.provides（组件的第一次provide）
        currentInstance.provides[key] = val
    }
}

/**
 * setup中的inject方法
 * @param key 
 * @param defaultVal 
 */
export function inject(key: string, defaultVal?: any) {
    const currentInstance: ComponentInternalInstance = getCurrentInstance()

    if (currentInstance) {
        const parentProvides = currentInstance.parent?.provides!
        // for in是会查原型链的，同时有一个判断是否存在
        if (parentProvides && key in parentProvides) {
            return parentProvides[key]
        }
        else if (defaultVal !== undefined) {
            return typeof defaultVal === "function" ? defaultVal() : defaultVal;
        }
    }
}