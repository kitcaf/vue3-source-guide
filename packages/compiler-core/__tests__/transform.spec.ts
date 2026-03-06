// packages/compiler-core/__tests__/transformText.spec.ts

import { describe, it, expect } from 'vitest';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { transformText } from '../src/transforms/transformText';
import { transformExpression } from '../src/transforms/transformExpression';
import { CompoundExpressionNode, ElementNode, NodeTypes } from '../src/ast';

describe('transform', () => {
    it('plugin transformText', () => {
        // 准备 AST：这里包含了一个文本 "hi, " 和一个插值 "{{ msg }}"
        const ast = baseParse('<div>hi, {{ msg }}</div>');

        // 注意插件顺序：先传入 expression 处理变量名，再传 text 合并文本
        transform(ast, {
            nodeTransforms: [transformExpression, transformText]
        });

        // 取出 div 节点
        const divNode = ast.children[0];

        // 断言一：原本有 2 个子节点，合并后 children 数组长度应该变成 1！
        expect((divNode as ElementNode).children.length).toBe(1);

        // 断言二：这个剩下的唯一独苗，应该是一个复合表达式节点
        const compoundNode = (divNode as ElementNode).children[0] as CompoundExpressionNode;
        expect(compoundNode.type).toBe(NodeTypes.COMPOUND_EXPRESSION);

        // 断言三：扒开这个复合节点，里面应该是 [TEXT, " + ", INTERPOLATION] 的完美结构
        expect(compoundNode.children[0].type).toBe(NodeTypes.TEXT);
        expect(compoundNode.children[1]).toBe(" + "); // 重点！成功的关键标记
        expect(compoundNode.children[2].type).toBe(NodeTypes.INTERPOLATION);

        // 断言四：检查底层的 transformExpression 是否依然生效了？
        expect((compoundNode.children[2] as any).content.content).toBe('_ctx.msg');
    });
});