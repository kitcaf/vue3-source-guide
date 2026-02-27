// packages/compiler-core/__tests__/parse.spec.ts

import { describe, it, expect } from 'vitest';
import { NodeTypes, ElementTypes } from '../src/ast';
import { createParserContext, parseInterpolation } from '../src/parse';

describe('compiler: parse', () => {

    describe('parseInterpolation', () => {

        it('should parse simple interpolation', () => {
            // 1. 准备测试上下文 (包含前后空格)
            const context = createParserContext('{{ message }}');

            // 2. 执行解析
            const astNode = parseInterpolation(context);

            // 3. 断言 AST 节点结构 (使用 strictEqual 保证没有多余或遗漏的属性)
            expect(astNode).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: 'message', // 验证前后的空格是否被正确 trim 掉
                },
            });

            // 4. 断言副作用：被解析完的字符串应该从 source 中被“吃掉”
            expect(context.source).toBe('');
        });

        it('should parse interpolation without spaces', () => {
            // 1. 准备测试上下文 (不含空格)
            const context = createParserContext('{{msg}}');

            // 2. 执行解析
            const astNode = parseInterpolation(context);

            // 3. 断言解析出的变量名是否正确
            expect(astNode.content.content).toBe('msg');

            // 4. 断言上下文已被清空
            expect(context.source).toBe('');
        });
    })
});