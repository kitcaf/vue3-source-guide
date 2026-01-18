import { shallowReadonly } from "@mini-vue/reactivity";
import { ComponentInternalInstance } from "./component";

const EMPTY_OBJ = Object.freeze({});
/**
 * 初始化组件props
 * @param instance
 * @param rawProps 
 */
export function initProps(instance: ComponentInternalInstance, rawProps: any) {
    instance.props = rawProps ? shallowReadonly(rawProps) : EMPTY_OBJ
}