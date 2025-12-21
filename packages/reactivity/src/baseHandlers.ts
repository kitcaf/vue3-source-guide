import { extend, isObject } from "@mini-vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlag, readonly } from "./reactive";

/**
 * createGetter 通过默认参数 + 闭包 的行为提高代码复用性
 * @param isReadonly 
 * @returns 
 */
export function createGetter(isReadonly = false, shallow = false) {
    // target (Object): 原生对象 
    // key (String | Symbol): 属性名
    //  receiver (Object): 代理对象本身
    return function getter(target: any, key: string | symbol, receiver: any) {
        // 拦截Flags的读取
        // 判断是不是Reactive proxy对象
        if (key === ReactiveFlag.IS_REACTIVE) {
            return !isReadonly //取反就好了
        }
        // 判断是不是Readonly proxy对象
        if (key === ReactiveFlag.IS_READONLY) {
            return isReadonly
        }

        // const res = target[key] 对象有get属性并且里面有this的嵌套依赖问题
        // 保证每一个属性都会触发到代理的get保证收集成功依赖
        // const res = target[key]
        const res = Reflect.get(target, key, receiver)
        //注意isObject(res)要isObject(res)之前
        if (!isReadonly) track(target, key)

        //shallow 直接返回
        if (shallow) return res

        // 根据返回值res判断，如果res是对象，需要再根据这个对象建立响应式
        // 最后要不要返回响应式对象，或者需不需要将obj = {a: { b : 1}}
        // 改为obj.a的指针改为proxy对象
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        return res
    }
}

/**
 * createSetter 通过默认参数 + 闭包 的行为提高代码复用性
 * @param isReadonly 
 * @returns 
 */
export function createSetter(isReadonly = false) {
    return function set(target: any, key: string | symbol, newValue: any, receiver: any) {
        // 直接返回警告，同时不允许修改
        if (isReadonly) {
            console.warn(
                `Set operation on key "${String(key)}" failed: target is readonly.`,
                target
            );
            return true
        }
        // target[key] = newValue
        const res = Reflect.set(target, key, newValue, receiver)
        trigger(target, key)
        return true
    }
}

// 执行一次，这个对象创建之后就不会再创建了，相当于就是静态的
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)
const shallowReadonlyGet = createGetter(true, true)

/**
 * 导出 mutableHandlers对象 -- 这个对象就不用多次创建了
 */
export const mutableHandlers = {
    get,
    set
};

/**
 * 导出 mutableHandlers对象
 */
export const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet
};

/**
 * 导出 shallowReadonlyHandlers对象，直接使用extend进行复用
 */
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})