import { ElementNode, ElementTypes, InterpolationNode, NodeTypes } from "./ast"

const enum TagType {
    Start, // 开始标签
    End //结束标签
}

// 定义解析上下文的接口
export interface ParserContext {
    source: string
    // 实际过程中 还会存一下内容
    // offset ：绝对索引（从 0 开始记录已经处理了多少个字符）。
    // line：当前行号（初始为 1）。
    // column：当前列号（初始为 1）。
    // 用于错误处理记录错误发生的位置，通过advanceBy动态更新就可以
}

/**
 * 返回编译器的解析上下文
 * @param content 最原始的字符串
 * @returns 
 */
export function createParserContext(content: string): ParserContext {
    return {
        source: content
    }
}

/**
 * 消费（截取）前面部分指定长度的字符串
 * 比如“{{message}}” 消费2，就是"message}}"
 * @param context 
 * @param length 
 */
function advanceBy(context: ParserContext, length: number): void {
    context.source = context.source.slice(length)
}

/**
 * 解析插值 {{ }} 
 * @param context context 解析器上下文
 */
export function parseInterpolation(context: ParserContext): InterpolationNode {
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    // 找closeDelimiter的位置"}}"，返回的是第一个}的下标
    // 从 openDelimiter.length (即 2) 的位置开始找，跳过开头的 "{{"
    let closeIndex = context.source.indexOf(closeDelimiter,
        openDelimiter.length
    )

    // =========== 错误处理 =============
    if (closeIndex === -1) {
        // 省略错误保持
        // 容错恢复：既然找不到 "}}"，我们就假设从 "{{" 后面一直到整个字符串结束，都是这个插值的内容。
        closeIndex = context.source.length;
    }

    // 吃掉开头的 "{{"
    advanceBy(context, openDelimiter.length)

    // 计算内部表达式的长度
    // 例如 "{{ message }}"，此时 source 是 " message }}"
    // closeIndex 原本是 11，减去 "{{" 的长度 2，内部长度为 9
    const rawContentLength = closeIndex - openDelimiter.length

    // 提取出原始的内容
    const rawContent = context.source.slice(0, rawContentLength)

    // 将这部分内部内容从上下文的字符串中吃掉
    advanceBy(context, rawContentLength)

    // 剔除表达式前后的空格，得到纯净的变量名
    const content = rawContent.trim()

    // 吃掉结尾的 "}}"
    advanceBy(context, closeDelimiter.length)

    // 返回解析插值节点
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

/**
 * 解析单个标签（开始标签或结束标签）
 * @param context context 解析器上下文
 * @param type type 当前要解析的是开始还是结束标签
 */
function parseTag(context: ParserContext, type: TagType)
    : ElementNode // 自闭和标签需要返回给调用者不需要回调它的子类了
    | undefined {
    // 1. 编写正则匹配标签名
    // 如果是开始标签，匹配 /^<([a-z][^\t\r\n\f />]*)/i  (例如: "<div")
    // 如果是结束标签，匹配 /^<\/([a-z][^\t\r\n\f />]*)/i (例如: "</div")
    const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);

    if (!match) return undefined

    // 提取标签名 正则的捕获组div
    const tag = match[1];

    // 吃掉匹配到的部分，例如 "<div" match[0]是整个捕获的字符串
    advanceBy(context, match[0].length)

    // 吃标签闭合的 ">" 或者 "/>"（自闭合标签）
    const isSelfClosing = context.source.startsWith("/>")
    advanceBy(context, isSelfClosing ? 2 : 1)

    if (type === TagType.End) {
        return undefined
    }

    return {
        type: NodeTypes.ELEMENT,
        tag: tag,
        tagType: ElementTypes.ELEMENT, // 这里先默认都是原生元素
        children: [],
        isSelfClosing: isSelfClosing // 是否是自闭合
    }
}

/**
 * 解析完整的 Element 节点
 * @param context 
 */
export function parseElement(context: ParserContext): ElementNode {
    // 解析开始标签
    // 此时 context.source 比如是 "<div>hello</div>"
    // 执行后，element 拿到 AST 节点，context.source 变成 "hello</div>"
    const element = parseTag(context, TagType.Start);

    if (!element) {
        throw new Error('Failed to parse start tag.');
    }

    // 处理子元素 【占位符 - parseChildren、后续章节实现其实就是while循环-去继续递归子元素】
    if (!element.isSelfClosing) {

        element.children = parseChildren(context);

        // 校验结束标签是否与开始标签匹配
        if (context.source.startsWith(`</${element.tag}>`)) {
            parseTag(context, TagType.End);
        } else {
            throw new Error(`缺少结束标签: </${element.tag}>`);
        }
    }
    return element
}

export function parseChildren(context: ParserContext): ElementNode[] { return [] }
