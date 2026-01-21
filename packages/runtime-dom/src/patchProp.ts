import { inOn } from "@mini-vue/shared";

type EventValue = Function | undefined

/**
 * 事件包装器
 */
interface Invoker extends EventListener {
    value: EventValue
}

/**
 * 事件包装器对象-对某个特定的元素来说每个属性构建一个包装器
 */
interface HTMLElementWithVei extends HTMLElement {
    _vei?: Record<string, Invoker | undefined>
}

export function patchProp(
    el: HTMLElementWithVei,
    key: string,
    preVal: any,
    nextVal: any): void {
    // 处理事件
    if (inOn(key)) {
        //事件名：onClick -> click
        const eventName = key.slice(2).toLowerCase();

        //初始化缓存，如果_vei不存在，那么对el._vei 赋值对象
        const invokers = el._vei || (el._vei = {})
        const existingInvoker = invokers[eventName];
        // 场景1：更新
        if (nextVal && existingInvoker) {
            existingInvoker.value = nextVal
        }
        // 场景2：挂载初始化
        else {
            // 新增事件
            if (nextVal) {
                const invoker = ((e: Event) => {
                    // 包装器就是执行invoker.value函数
                    invoker.value!(e)
                }) as Invoker

                invoker.value = nextVal
                invokers[eventName] = invoker
                el.addEventListener(eventName, invoker)
            }
            // nextVal null，existingInvoker 还存在
            // 说明是某种情况依赖更新，用户不想要这个事件
            // 一定要removeEventListener，因为现在是包装器引用不变
            // 否则：（1）继续执行（2）内存泄露
            else if (existingInvoker) {
                el.removeEventListener(eventName, existingInvoker)
                // 清空这个属性Invoker引用
                invokers[eventName] = undefined;
            }
        }
    }
    else {
        if (nextVal == null) {  //【删除属性】
            el.removeAttribute(key);
        } else { //【新增/更新属性】
            // 设置新属性
            el.setAttribute(key, nextVal);
        }
    }
}


