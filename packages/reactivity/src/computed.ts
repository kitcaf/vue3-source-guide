import { hasChanged } from "@mini-vue/shared"
import { ReactiveEffect } from "./effect"
import { trackRefValue, triggerRefValue } from "./ref"

/**
 * ComputedRefImp类
 */
class ComputedRefImp {
    /**
     * 
     */
    private _dirty: Boolean = true
    /**
     * 
     */
    private _value: any //缓存结果
    /**
     * 
     */
    private _effct: ReactiveEffect
    /**
     * value 就是需要对getter函数结果值进行拦截
     */
    readonly __v_isRef = true //让proxyRefs识别，避免模板中写.value
    /**
     * 
     */
    readonly dep?: Set<ReactiveEffect>;

    constructor(public fn: Function) {
        this.dep = new Set<ReactiveEffect>()

        this._effct = new ReactiveEffect(this.fn, () => {
            if (this.dep!.size === 0) { //没有外层监听computed变量
                this._dirty = true
                return
            }

            const newValue = this._effct.run();
            //既然上面都计算了，那就无论如何都get value()都不应该计算
            this._dirty = false;
            if (hasChanged(newValue, this._value)) {
                //未来避免get value再计算一遍，这里直接赋值
                this._value = newValue
                //同时派发外层的依赖
                triggerRefValue(this)
            }
        })
    }

    get value() {
        trackRefValue(this) // 让effect(() => computed变量) 收集这个依赖

        if (this._dirty) { //如果是dirty
            this._value = this._effct.run()
            this._dirty = false
        }
        return this._value //否则返回缓存值
    }
}

export function computed(getter: Function) {
    return new ComputedRefImp(getter)
}