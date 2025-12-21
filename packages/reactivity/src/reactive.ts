import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"
import { track, trigger } from "./effect"
/**
 * ReactiveObject：
 * （1）劫持读取 (GET) - 存储依赖
 * （2）劫持修改 (SET) - 查找依赖
 */

export const enum ReactiveFlag {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

export const reactiveMap = new WeakMap<Object, any>()
export const readOnlyMap = new WeakMap<Object, any>()
export const shallowReadonlyMap = new WeakMap();

/**
 * reactive 核心就是返回对对象的Proxy
 * @param raw 
 */
export function reactive(raw: any) {
    return createActiveObject(raw, mutableHandlers, reactiveMap)
}

/**
 * readonlyReactive 返回readonlyReactive对象
 * @param raw 
 */
export function readonly(raw: any) {
    return createActiveObject(raw, readonlyHandlers, readOnlyMap)
}

export function shallowReadonly(raw: any) {
    return createActiveObject(raw, shallowReadonlyHandlers, shallowReadonlyMap);
}

/**
 * // 1. 尝试读取特殊属性
 * @param value 
 * 2. 如果 value 是 Proxy，触发 get 拦截，返回 true
 * 3. 如果 value 是普通对象，返回 undefined
 * 4. 使用 !! 将 undefined 强转为 boolean (false)
 */
export function isReactive(value: any) {
    return !!value[ReactiveFlag.IS_REACTIVE]
}

export function isReadonly(value: any) {
    return !!value[ReactiveFlag.IS_READONLY]
}

/**
 * 判断isProxy，其实就是isReactive或者isReadonly返回true就可以
 * @param value 
 */
export function isProxy(value: any) {
    return isReactive(value) || isReadonly(value)
}

// 抽离通用的 Proxy 创建逻辑
function createActiveObject(raw: any, baseHandlers: any, proxyMap: WeakMap<Object, any>) {
    // 查询一下缓存命中
    const exsitProxy = proxyMap.get(raw)
    if (exsitProxy) {
        return exsitProxy
    }

    //加入到缓存中
    const proxy = new Proxy(raw, baseHandlers);
    proxyMap.set(raw, proxy)
    return proxy
}