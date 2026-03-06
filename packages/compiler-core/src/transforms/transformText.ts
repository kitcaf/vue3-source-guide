/**
 * 合并children中的相邻文本类型的节点（普通文本或插值都算）
 */

import { ASTNode, NodeTypes, TransformContext, CompoundExpressionNode } from "../ast";

function isText(node: ASTNode) {
    return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}

/**
 * 合并children中相邻的文本类型的节点 node
 * @param node 
 * @param context 
 */
export function transformText(node: ASTNode, context: TransformContext) {
    // 保证阶段存在children
    if (node.type === NodeTypes.ROOT || node.type === NodeTypes.ELEMENT) {
        // 返回一个Exit函数, 后处理
        return () => {
            const children = node.children
            // 计算完后的新数组
            const newChildren: ASTNode[] = []
            // 每一个合并的区域的合并到地方CompoundExpressionNode，第一次进入区域时进行创建
            let newContainer: CompoundExpressionNode | undefined = undefined

            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                if (isText(child)) {
                    if (newContainer) {
                        (newContainer as CompoundExpressionNode).children.push(" + ", child)
                    } else {
                        // 如果没有容器，看看下一个元素是不是文本，只有下一个也是才创建CompoundExpressionNode
                        const next = children[i + 1];
                        if (next && isText(next)) {
                            newContainer = {
                                type: NodeTypes.COMPOUND_EXPRESSION,
                                children: []
                            }
                            newChildren.push(newContainer)
                        } else { // 否则表示不用合并，普通的元素
                            newChildren.push(child)
                        }
                    }
                }
                else {
                    newContainer = undefined; //置空
                }
            }
            node.children = newChildren;
        }
    }
}