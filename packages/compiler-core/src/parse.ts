import { ASTNode, ElementNode, ElementTypes, InterpolationNode, NodeTypes, RootNode, TextNode } from "./ast"

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
export function parseElement(context: ParserContext, ancestors: string[]): ElementNode {
    // 解析开始标签
    // 此时 context.source 比如是 "<div>hello</div>"
    // 执行后，element 拿到 AST 节点，context.source 变成 "hello</div>"
    const element = parseTag(context, TagType.Start);

    if (!element) {
        throw new Error('Failed to parse start tag.');
    }

    // 处理子元素 【占位符 - parseChildren、后续章节实现其实就是while循环-去继续递归子元素】
    if (!element.isSelfClosing) {
        // 递归本节点的所有子元素
        ancestors.push(element.tag) // 将本元素的标签放入ancestors
        element.children = parseChildren(context, ancestors);
        ancestors.pop() // 恢复现场

        // 校验结束标签是否与开始标签匹配
        if (context.source.startsWith(`</${element.tag}>`)) {
            parseTag(context, TagType.End);
        } else {
            throw new Error(`缺少结束标签: </${element.tag}>`);
        }
    }
    return element
}

/**
 * 解析文本节点
 * @param context 
 */
export function parseText(context: ParserContext): TextNode {
    // 默认endIndex的位置为最大，所有的长度
    let endIndex = context.source.length
    const endTokens = ["<", "{{"]

    // 从这两种endTokens中找一个最近的位置
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        // 更新endIndex, 注意indexOf没有找到返回-1
        if (index !== -1 && index < endIndex) {
            endIndex = index
        }
    }
    // 进行切分文本部分
    const content = context.source.slice(0, endIndex)

    // 吃掉字符串部分
    advanceBy(context, content.length);

    return {
        type: NodeTypes.TEXT,
        content: content
    }
}

/**
 * 返回当前层的Children节点
 * 结束条件：字符串空了或者栈匹配到了当前层的元素
 * @param context
 * @param ancestors 
 */
export function parseChildren(context: ParserContext, ancestors: string[]): ElementNode[] {
    const node: ASTNode[] = []

    // 遍历它的所有子节点
    while (!isEnd(context, ancestors)) {
        // ELement子节点 - 内层会继续递归它的子节点（这里判断全一点必须<+字母）
        if (context.source[0] === "<" && /[a-z]/i.test(context.source[1])) {
            /**
             * 第一次调用也就是isEnd（字符串）开启一个循环
             * 后面的parseChildren一定是parseElement引起的，
             * 而要获取本层的节点标签一定是parseElement，因此ancestors在parseElement里面进行处理
             */
            node.push(parseElement(context, ancestors))
        }
        // {{}} 解析插值叶子节点
        else if (context.source.startsWith("{{")) {
            node.push(parseInterpolation(context))
        }
        // 文本叶子节点
        else {
            node.push(parseText(context))
        }
    }
    return node
}

/**
 * 判断子节点是否为空
 * 第一次：parseChildren是判断context字符串不为空
 * 后面：通过栈来判断，</, 遇到进行判断是否是栈顶元素如果是，那么表示结束了
 * @param context 
 * @param ancestors 
 */
function isEnd(context: ParserContext, ancestors: string[]): boolean {
    const s = context.source;
    if (s.startsWith("</")) {
        // 从栈顶向下寻找，看看有没有匹配的祖先标签
        // 这样做是为了容错：如果用户写了 <div><span></div> (漏了 </span>)
        // 状态机会直接向上查找到 div，从而强行结束 span 的解析，避免死循环
        for (let i = ancestors.length - 1; i >= 0; i--) {
            if (s.startsWith(`</${ancestors[i]}>`)) {
                return true
            }
        }
    }
    // 如果字符串被消费光了，也结束
    return !s
}

/**
 * 包装生成 Root 节点
 * @param children 子节点数组
 */
function createRoot(children: ASTNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children: children
    }
}

/**
 * 【最终入口】解析模板字符串，生成 AST 树
 * @param content 原始模板字符串
 * @returns 完整的 AST 根节点
 */
export function baseParse(content: string): RootNode {
    // 创建全局唯一的解析上下文
    const context = createParserContext(content)

    // 将整个模板作为一个整体，调用 parseChildren 进行联合解析
    // 最外层解析时，ancestors 祖先栈肯定是空的 []，此时的判断一定是字符串是否为空
    const children = parseChildren(context, []);
    return createRoot(children)
}


