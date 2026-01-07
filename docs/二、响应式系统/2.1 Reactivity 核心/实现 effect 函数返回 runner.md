---
order: 3
---

## 实现 effect 函数返回 runner

> 实现原因：未来要实现`computed` (计算属性)，**`computed` 本质上是一个 “懒执行”且“有返回值”的 effect函数。**

`effect(fn)` 执行后，应该返回一个函数（runner），本质就是返回`effect`中的run方法。当用户调用这个 runner 时，`fn` 应该再次执行，并且返回 `fn` 的计算结果

- 修改effect函数

```tsx
export function effect(fn: Function) {
    //创建ReactiveEffect
    const _reactiveEffect = new ReactiveEffect(fn)
    _reactiveEffect.run()

    //返回_reactiveEffect中的run方法
    //就是将_reactiveEffect.run的函数指针赋值就好了，因为run方法里面有this指向
    //因此需要bind出来
    const runner: any = _reactiveEffect.run.bind(_reactiveEffect)
    return runner
}
```

- 修改 `ReactiveEffect.run` 方法，**使其有返回值。作用于computed函数中**

```tsx
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
        const result = this._fn()
        //置为空
        activatEffect = undefined
        return result
    }
}
```
