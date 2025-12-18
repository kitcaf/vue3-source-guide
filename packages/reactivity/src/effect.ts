/**
 * Effect 上下文
 * 依赖收集与派发更新算法
 */

//全局变量
let activatEffect: undefined | ReactiveEffect //指针

let targetMap = new WeakMap() //依赖图谱

//ReactiveEffect类
export class ReactiveEffect {
    private _fn: Function

    constructor(fn: Function) {
        this._fn = fn
    }

    run() {
        //记录当前创建的ReactiveEffect对象
        activatEffect = this
        //调用函数 - 里面如果访问了响应式对象就会导致track并收集ReactiveEffect依赖
        this._fn()
        //置为空
        activatEffect = undefined
    }
}

export function effect(fn: Function) {
    //创建ReactiveEffect
    const _reactiveEffect = new ReactiveEffect(fn)

    _reactiveEffect.run()
}

/**
 * track - 依赖收集 在响应式对象中的getter里面调用 
 * 对应的副作用是activatEffect 指向的对象
 */
export function track(target: any, key: String | symbol) {
    //初步判断 任意响应式的访问都会导致track，但是不是所有的都要收集依赖
    //只有effect函数的执行才会被收集依赖
    if (!activatEffect) return

    //找到对应的depsMap-本质就是map
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        // 注意js中的对象是值传递，也就是target是内存对象的地址
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key) //获得对应key中的dep
    if (!dep) { //dp不存在
        dep = new Set<ReactiveEffect>()
        depsMap.set(key, dep)
    }

    //后面就是将activatEffect指向的ReactiveEffect加入到对应key的dep中
    trackEffects(dep)
}

// 抽离具体的收集逻辑，方便后续复用
export function trackEffects(dep: Set<ReactiveEffect>) {
    //activatEffect和判重
    if (activatEffect && !dep.has(activatEffect)) {
        dep.add(activatEffect)
    }
}

/**
 * trigger
 * 响应式对象被setter时，触发更新对应的副作用
 */
export function trigger(target: any, key: String | symbol) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const dep = depsMap.get(key)
    //执行所有副作用
    triggerEffects(dep)
}

export function triggerEffects(dep: Set<ReactiveEffect>) {
    if (dep) {
        for (const effect of dep) {//Set类型的for循环, of
            effect.run()
        }
    }
}





