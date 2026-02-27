import { InterpolationNode, NodeTypes } from "./ast"


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