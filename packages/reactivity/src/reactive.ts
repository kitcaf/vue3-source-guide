import { track, trigger } from "./effect"
/**
 * ReactiveObject：
 * （1）劫持读取 (GET) - 存储依赖
 * （2）劫持修改 (SET) - 查找依赖
 */

/**
 * reactive 核心就是返回对对象的Proxy
 * @param raw 
 */
export function reactive(raw: any) {
    return new Proxy(raw, {
        // target (Object): 原生对象 
        // key (String | Symbol): 属性名
        //  receiver (Object): 代理对象本身
        get(target, key, receiver) {
            // const res = target[key] 对象有get属性并且里面有this的嵌套依赖问题
            // 保证每一个属性都会触发到代理的get保证收集成功依赖
            console.log(`Proxy getter触发 ${String(key)} ${target}`)
            // const res = target[key]
            const res = Reflect.get(target, key, receiver)
            track(target, key)
            return res
        },

        set(target, key, newValue, receiver) {
            console.log(`Proxy setter触发 ${key as String} ${target}`)
            // target[key] = newValue
            const res = Reflect.set(target, key, newValue, receiver)
            trigger(target, key)
            return true
        }
    })
}

export function creatReactive() {

}