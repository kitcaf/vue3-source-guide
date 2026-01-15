import { createVNode } from "./vnode"
import { type VNode } from "./vnode"

/**
 * createAppAPI:
 * 产生createApp工厂函数的工厂（高阶函数）。
 * 它的作用是接收 render 函数，然后返回真正的 createApp 函数。
 * * @param render - 由 Renderer 传入的具体渲染函数
 * 依据是闭包进行，将createAppAPI把runtime-core中的核心render函数作为参数
 */
export function createAppAPI(
    render: (vnode: VNode, container: Element) => void
) {
    return function createApp(rootComponent: any) {
        return {
            // 核心挂载方法 rootContainer 挂载的DOM对象
            mount(rootContainer: Element) {
                // 1. rootComponent 转换为虚拟节点
                const vnode = createVNode(rootComponent)
                // 2. 触发渲染核心，将vnode + rootContainer构成
                // vnode树，然后转换为真实DOM，显示在页面上
                render(vnode, rootContainer)
            }
        }
    }
}