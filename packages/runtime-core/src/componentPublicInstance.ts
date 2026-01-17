import { ComponentInternalInstance } from "./component"

/**
 * 专门处理 $ 开头的公共属性
 * key: 用户访问的属性名 ($slot, $el)
 * value: 函数，接收 instance，返回具体的值
 */
const publicPropertiesMap: Record<string, (i: ComponentInternalInstance) => any> = {
    // （$el一般是在生命中期中访问（this.$el），template不会使用）
    // 当用户访问 this.$el 时，返回 instance.vnode.el
    $el: (i) => i.vnode.el,
    // $slots 后面会实现
    // $slots: (i) => i.slots
    // $emit等等
}

export const PublicInstanceProxyHandlers = {
    // 解构动作：取出 target._ 赋值给 instance 变量（ES6解构+重命名）
    get({ _: instance }: { _: ComponentInternalInstance }, key: string) {
        const { setupState } = instance;

        // 检测setupState
        if (key in setupState) {
            return setupState[key]
        }

        // $ 开头的公共属性
        const publicProperty = publicPropertiesMap[key]
        if (publicProperty) {
            return publicProperty(instance)
        }

        //后续实现检测props
    }
}