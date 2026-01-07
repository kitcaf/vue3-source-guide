---
order: 6
---

# 实现 effect 的 scheduler 功能

目前的实现中，我们的响应式系统是 **同步且贪婪** 的

**现实场景：**

- 同步更新带来的性能隐患。当前的逻辑是：`trigger` 触发 -> 遍历 `Dep` -> 立即调用 `effect.run()`。这意味着，如果你在一个循环里连续修改 100 次数据，`effect` 就会被迫重新执行 100 次

```tsx
const obj = reactive({ count: 1 });
effect(() => {
    console.log(obj.count); // 假设这是极其昂贵的 DOM 更新操作
});

for(let i = 0; i < 100; i++) {
    obj.count++; //  昂贵的 DOM 更新会执行 100 次！
}
```

在实际的 Vue 中，我们要的是 **最终一致性**：不管你中间变了多少次，只在最后更新一次 DOM才是必须的。

解决方案：**控制反转 (Inversion of Control)**

**Scheduler 的本质：**它是 `trigger` 阶段的一个 **拦截器 (Interceptor)**

- **没有 Scheduler:** Trigger -> `effect.run()`
- **有 Scheduler:** Trigger -> `effect.scheduler()` -> (用户自定义逻辑：比如放到微任务队列里) -> `effect.run()`

具体实现：

注意：**Scheduler在系统层面给拦截调度，最终上面的这个问题就需要通过Scheduler制定调度策略才能解决。后期有next ticker就是一个明显的例子**

- 改造 `ReactiveEffect` 类 (数据结构)

```tsx
export class ReactiveEffect {
    private _fn: Function;
    
    // 【新增】scheduler 是一个可选的公开属性
    // public scheduler?: Function 是 TS 的简写，
    // 等同于在类里声明属性，并在 constructor 里赋值
    constructor(fn: Function, public scheduler?: Function) {
        this._fn = fn;
    }

    // run, stop 等方法保持不变...
}
```

- 改造 `effect` 入口函数 (接口层)， 允许用户在调用 `effect` 时通过 `options` 传递 `scheduler`

```tsx
// 新建一个packages/shared/src/index.ts文件，shared模块
export const extend = Object.assign;

//packages/reactivity/src/effect.ts
// 1. 定义 options 接口 (规范类型)
export interface ReactiveEffectOptions {
    scheduler?: Function;
    onStop?: () => void;
}

// 2. 修改 effect 函数签名
export function effect(fn: Function, options: ReactiveEffectOptions = {}) {
    // 【新增】将 options.scheduler 传给构造函数
    const _effect = new ReactiveEffect(fn, options.scheduler);
    
    // 把 options 里的其他属性（如 onStop）合并到 _effect 对象上
    // extend 只是 Object.assign 的封装， 将 options 对象里的所有属性，
    //浅拷贝（Shallow Copy）到 _effect 对象上， 为什么不直接写到constructor？可能写法
    extend(_effect, options); 

    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;

    return runner;
}
```

- 改造 `trigger` 逻辑 (核心算法)

```tsx
// inside triggerEffects function
export function triggerEffects(dep: Set<ReactiveEffect>) {
    if (dep) {
        for (const effect of dep) {
            if (effect.scheduler) {
                // 1. 如果有调度器，执行调度器 (把控制权交给用户)
                effect.scheduler();
            } else {
                // 2. 如果没有，维持原有的同步执行行为
                effect.run();
            }
        }
    }
}
```