import { enableTracking, pauseTracking } from "./effect";
import { toRaw } from "./reactive";

// 定义拦截器对象-- 里面就是拦截后返回的函数
export const arrayInstrumentations: Record<string | symbol, Function> = {}

//需要拦截的数组方法列表 --- 处理修改
export const instrumentations = ['push', 'pop', 'shift', 'unshift', 'splice'];

instrumentations.forEach((key: any) => {
    const originalMethod = Array.prototype[key]; //真实的push | pop方法指针

    // 调用拦截器对象的方法 （1）this: 响应式对象 proxy （2）正常参数 
    // a = reactivate([]), a.push(1) : getter拦截返回arrayInstrumentations['push']
    // 变成了调用a.arrayInstrumentations['push'](1)。那么 调用这个函数的proxy
    arrayInstrumentations[key] = function (this: any, ...args: any[]) {
        pauseTracking()

        //  执行原生方法
        // 这里的 this 是 Proxy --- 因为会在getter中拦截返回函数，我们需要转为原始对象 (toRaw)
        // 这样操作更纯粹，避免在操作过程中触发不必要的 Proxy 拦截

        const res = originalMethod.apply(toRaw(this), args)

        enableTracking()

        return res
    }
})  