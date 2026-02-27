
// 定义所有可能出现的 AST 节点类型枚举
export const enum NodeTypes {
    INTERPOLATION,  // 插值节点 {{ }}
    SIMPLE_EXPRESSION, // 简单表达式节点（属于插值节点的子类型 - content里面的type子类型）
    ELEMENT, // 新增：元素节点类型
}

// 简单表达式节点的类型接口
export interface SimpleExpressionNode {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string // 例如 "message"
}

// 插值节点的类型接口
export interface InterpolationNode {
    type: NodeTypes.INTERPOLATION,
    content: SimpleExpressionNode
}

// 区分元素的具体类型（原生元素、组件等）- 是一个枚举类型
export const enum ElementTypes {
    ELEMENT,   // 原生 HTML 元素，比如 div, span
    COMPONENT, // Vue 组件（后续扩展用）
}

export type ASTNode = ElementNode | any /* 暂用占位，代表其他类型节点 */;

export interface ElementNode {
    type: NodeTypes.ELEMENT
    tag: string
    tagType: ElementTypes
    children: ASTNode[]
    isSelfClosing?: boolean
}

