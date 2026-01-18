import { hasOwn } from "@mini-vue/shared";
import { ComponentInternalInstance } from "./component"

/**
 * 专门处理 $ 开头的公共属性
 * key: 用户访问的属性名 ($slot, $el)
 * value: 函数，接收 instance，返回具体的值
 */
const publicPropertiesMap: Record<string, (i: ComponentInternalInstance) => any> = {
    // （$el一般是在生命中期中访问（_ctx/this.$el），template不会使用）
    // 当用户访问 this.$el 时，返回 instance.vnode.el
    $el: (i: ComponentInternalInstance) => i.vnode.el,
    // @emit 当用户访问 _ctx/this.$emit 时, 返回另一个函数
    $emit: (i: ComponentInternalInstance) => i.emit,
    // $slots 
    $slots: (i: ComponentInternalInstance) => i.slots
}

export const PublicInstanceProxyHandlers = {
    // 解构动作：取出 target._ 赋值给 instance 变量（ES6解构+重命名）
    get({ _: instance }: { _: ComponentInternalInstance }, key: string) {
        const { setupState, props } = instance;

        // 检测setupState
        if (hasOwn(setupState, key)) {
            return setupState[key]
        }
        // 查props，虽然也可以直接if, 但是还是表达互斥关系好一点
        else if (hasOwn(props, key)) {
            return props[key]
        }

        // $ 开头的公共属性
        const publicProperty = publicPropertiesMap[key]
        if (publicProperty) {
            return publicProperty(instance)
        }
    }
}