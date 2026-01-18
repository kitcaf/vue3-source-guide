import { camelize, capitalize, toHandlerKey } from "@mini-vue/shared";
import { ComponentInternalInstance } from "./component";

export function emit(
    instance: ComponentInternalInstance,
    event: string,
    ...args: any) {
    const { props } = instance
    //处理事件名: add-foo -> addFoo -> onAddFoo
    const handlerName = toHandlerKey(capitalize(camelize(event)))

    const handler = props[handlerName]
    if (handler) {
        handler(...args)
    }
}