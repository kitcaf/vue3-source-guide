import { hasChanged, isObject } from "@mini-vue/shared";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { reactive, toRaw } from "./reactive";

//packages/reactivity/src/ref.ts
class RefImpl {
    private _value: any;
    /**
     * _rawValue保留最原始的数据；Proxy 对象不等于被代理的原生对象
     * 如果返回的Proxy 对象，那么rawValue就是被代理的原生对象
     * 
     * 如果不怎么写？
     * const obj = { foo: 1 };
     * const r = ref(obj);
     * r.value = obj; //重新赋值同一个对象，但是set不认为是同一个对象
     * Proxy 对象不等于被代理的原生对象不相同，导致组件重新渲染
     */
    private _rawValue: any;
    readonly dep?: Set<ReactiveEffect>;
    readonly __v_isRef = true


    constructor(value: any) {
        this._rawValue = value

        //直接改引用，get value直接就是指向响应式对象
        this._value = convert(value)
        this.dep = new Set<ReactiveEffect>()
    }

    get value() {
        //收集依赖，不需要全局 targetMap 查找，直接收集到 this.dep
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        // 先看看值变了没，变了才触发
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerRefValue(this)
        }
    }
}

/**
 * proxyRefs代理某个对象，可以将ref属性值unref
 * @param objectWithRefs 是一个对象：对象里面可能有ref对象属性
 */
export function proxyRefs(objectWithRefs: any) {
    return new Proxy(objectWithRefs, {
        get(target, key, receiver) {
            return unRef(Reflect.get(target, key, receiver))
        },

        // 也是要处理一下set，ref时将value加上
        set(target, key, newValue, receiver) {
            const oldValue = target[key]

            /**
             * 解决修改值不加value的修改：（防止 Ref 被意外杀掉）
             * 如果原来的值是 Ref，且新来的值【不是】Ref
             * 其实意味这用户想修改Ref的.value，而不是想替换掉整个Ref
             */
            if (isRef(oldValue) && !isRef(newValue)) {
                oldValue.value = newValue;
                return true;
            }
            return Reflect.set(target, key, newValue, receiver)
        },
    })
}

class ObjectRefImpl {
    public __v_isRef = true; // ref标志

    constructor(
        public _object: any,
        public _key: any,
    ) {

    }

    get value() {
        /**
         * 兼容普通对象
         * 如果 _object 是 reactive，它getter里自动解包了，unRef(值) 还是 值
         * 如果 _object 是普通对象，它getter返回 Ref，unRef(Ref) 变成 值。
         */
        const val = this._object[this._key]
        return unRef(val)
    }

    set value(newValue: any) {
        /**
         * 兼容普通对象 setter 
         * 普通对象没有 Proxy 帮我们拦截 setter
         * 必须手动判断：如果原值是 Ref，我们要更新 Ref.value
         */
        const raw = toRaw(this._object)
        const val = raw[this._key]

        //普通对象和reactive中的ref变量 直接处理
        if (isRef(val) && !isRef(newValue)) {
            val.value = newValue
        } else {
            //普通对象和reactive中的普通变量；既有响应式又有正常变量的修改
            this._object[this._key] = newValue
        }
    }
}

export function toRef(object: any, key: string) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object: any) {
    const ret: any = Array.isArray(object) ? new Array(object.length) : {}
    for (const key in object) {
        ret[key] = toRef(object, key)
    }
    return ret
}

export function trackRefValue(ref: any) {
    trackEffects(ref.dep!)
}

export function triggerRefValue(ref: any) {
    triggerEffects(ref.dep!);
}

// 如果是对象那么转换为reactive
function convert(value: any) {
    return isObject(value) ? reactive(value) : value;
}

export function ref(value: any) {
    return new RefImpl(value);
}

export function isRef(ref: any) {
    // 还是!! 需要将undefined 转换false
    return !!(ref && ref.__v_isRef === true)
}

export function unRef(ref: any) {
    return isRef(ref) ? ref.value : ref
}


