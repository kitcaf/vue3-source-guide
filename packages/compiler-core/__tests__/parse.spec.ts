// packages/compiler-core/__tests__/parse.spec.ts

import { describe, it, expect } from 'vitest';
import { NodeTypes, ElementTypes } from '../src/ast';
import { baseParse, createParserContext, parseChildren, parseInterpolation, parseText } from '../src/parse';

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

    describe('parseText', () => {

        it('should parse pure text', () => {
            // 1. 准备一段纯文本（没有标签和插值）
            const context = createParserContext('some simple text');

            const astNode = parseText(context);

            // 2. 断言生成的 AST 节点
            expect(astNode).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'some simple text',
            });

            // 3. 断言文本已被完全消费
            expect(context.source).toBe('');
        });

        it('should stop parsing at element tag "<"', () => {
            // 1. 文本后面跟着一个标签
            const context = createParserContext('hello<div></div>');

            const astNode = parseText(context);

            expect(astNode).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'hello',
            });

            // 2. 断言游标准确停在了 "<" 之前
            expect(context.source).toBe('<div></div>');
        });

        it('should stop parsing at interpolation "{{"', () => {
            // 1. 文本后面跟着一个插值
            const context = createParserContext('hello {{ message }}');

            const astNode = parseText(context);

            expect(astNode).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'hello ', // 注意：这里的空格属于文本的一部分，要保留
            });

            // 2. 断言游标准确停在了 "{{" 之前
            expect(context.source).toBe('{{ message }}');
        });
    });

    describe('parseChildren (联合解析)', () => {
        it('should parse mixed content correctly', () => {
            // 1. 准备一段混合了文本、插值、和嵌套元素的模板
            const content = '<div>hi, {{ message }}</div>';
            const context = createParserContext(content);

            // 2. 调用主循环（作为根节点，传入空的 ancestors 栈）
            // 注意：真实源码中这里会有个 parse 函数做统一包裹，我们直接调 parseChildren
            const astNodes = parseChildren(context, []);

            // 3. 断言生成的 AST 树结构
            expect(astNodes).toStrictEqual([
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'div',
                    tagType: ElementTypes.ELEMENT,
                    isSelfClosing: false,
                    children: [ // div 内部的 parseChildren 递归结果
                        {
                            type: NodeTypes.TEXT,
                            content: 'hi, ',
                        },
                        {
                            type: NodeTypes.INTERPOLATION,
                            content: {
                                type: NodeTypes.SIMPLE_EXPRESSION,
                                content: 'message',
                            },
                        }
                    ],
                }
            ]);

            // 4. 断言全文被彻底消费
            expect(context.source).toBe('');
        });

    });

    describe('compiler: parse 最终入口', () => {
        it('should parse a complete template', () => {
            // 假设这是我们传入 Vue 模板的内容
            const template = `<div><p>hi, {{ msg }}</p></div>`;

            // 直接调用 baseParse
            const ast = baseParse(template);

            // 断言这棵树的终极形态！
            expect(ast).toStrictEqual({
                type: NodeTypes.ROOT, // 外层是 RootNode
                children: [
                    {
                        type: NodeTypes.ELEMENT,
                        tag: 'div',
                        tagType: ElementTypes.ELEMENT,
                        isSelfClosing: false,
                        children: [
                            {
                                type: NodeTypes.ELEMENT,
                                tag: 'p',
                                tagType: ElementTypes.ELEMENT,
                                isSelfClosing: false,
                                children: [
                                    {
                                        type: NodeTypes.TEXT,
                                        content: 'hi, '
                                    },
                                    {
                                        type: NodeTypes.INTERPOLATION,
                                        content: {
                                            type: NodeTypes.SIMPLE_EXPRESSION,
                                            content: 'msg'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        });
    });
});