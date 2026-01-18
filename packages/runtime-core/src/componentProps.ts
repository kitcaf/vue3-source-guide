import { ComponentInternalInstance } from "./component";

/**
 * 初始化组件props
 * @param instance
 * @param rawProps 
 */
export function initProps(instance: ComponentInternalInstance, rawProps: any) {
    instance.props = rawProps || {}
}