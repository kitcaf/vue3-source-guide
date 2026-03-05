import { ASTNode, ElementNode, NodeTypes, RootNode, TransformContext, TransformOptions } from "./ast";

/**
 * 遍历单个节点
 * @param node 当前需要遍历的 AST 节点
 * @param context 转换上下文
 */
export function traverseNode(node: ASTNode, context: TransformContext) {
    context.currentNode = node
    // 当前节点的Exit巡检员列表
    const exitFns: any[] = [];

    // 新增：执行插件
    const nodeTransforms = context.nodeTransforms
    if (nodeTransforms) {
        for (let i = 0; i < nodeTransforms.length; i++) {
            const transformPlugin = nodeTransforms[i];

            
            const exitFn = transformPlugin(node, context)
            if (exitFn) exitFns.push(exitFn)
        }
    }

    switch (node.type) {
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            // ROOT 和 ELEMENT 都有 children，需要向下遍历
            traverseNode(node, context)
            break;
        // 下面的都是叶子节点 - 一定不会再次遍历
        case NodeTypes.INTERPOLATION:
        case NodeTypes.SIMPLE_EXPRESSION:
        case NodeTypes.TEXT:
            break;
    }

    // ================== Exit 阶段 ==================
    // 【关键】：必须反向执行（Reverse）！这是洋葱模型的特性（先进后出）
    let i = exitFns.length - 1
    while (i--) {
        exitFns[i]()
    }
}

/**
 * 遍历子节点数组的辅助函数
 * @param parent 
 * @param context 
 */
function traverseChildren(parent: ElementNode | RootNode, context: TransformContext) {
    const children = parent.children;
    if (children) {
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i]
            // 更新context
            context.childIndex = i
            context.parent = parent

            traverseNode(child, context)
        }
    }
}

// 定义 Transform 上下文接口
function createTransformContext(
    root: RootNode,
    options: TransformOptions
): TransformContext {
    return {
        root: root,
        currentNode: null,
        parent: null,
        childIndex: -1,
        nodeTransforms: options.nodeTransforms
    }
}

/**
 * AST 转换的总入口
 * @param root Parse 阶段生成的 RootNode 根节点
 */
export function transform(root: RootNode, options: TransformOptions) {
    const context: TransformContext = createTransformContext(root, options)
    traverseChildren(root, context)
}