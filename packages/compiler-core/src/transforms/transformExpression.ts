/**
 * 转换表达式插件
 * 专门处理插值节点 {{ }} 中的表达式
 */

import { ASTNode, NodeTypes, TransformContext } from "../ast";

export function transformExpression(node: ASTNode, context: TransformContext) {
    if (node.type === NodeTypes.INTERPOLATION) {
        // 简单表达式：直接修改node.content.content的内容
        if (node.content.type === NodeTypes.SIMPLE_EXPRESSION) {
            const rawContent = node.content.content;
            node.content.content = `_ctx.${rawContent}`
        }
    }
}