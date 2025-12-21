import { mutableHandlers, readonlyHandlers } from "./baseHandlers"
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

/**
 * reactive 核心就是返回对对象的Proxy
 * @param raw 
 */
export function reactive(raw: any) {
    return createActiveObject(raw, mutableHandlers)
}

/**
 * readonlyReactive 返回readonlyReactive对象
 * @param raw 
 */
export function readonly(raw: any) {
    return createActiveObject(raw, readonlyHandlers)
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
function createActiveObject(raw: any, baseHandlers: any) {
    return new Proxy(raw, baseHandlers);
}