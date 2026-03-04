
// ############### 编译阶段类型 ########################
// 定义所有可能出现的 AST 节点类型枚举
export const enum NodeTypes {
    INTERPOLATION,  // 插值节点 {{ }}
    SIMPLE_EXPRESSION, // 简单表达式节点（属于插值节点的子类型 - content里面的type子类型）
    ELEMENT, // 新增：元素节点类型
    TEXT, // 纯文本节点
    ROOT,
    ATTRIBUTE // 【新增】 属性节点
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

export type ASTNode =
    ElementNode
    | TextNode
    | RootNode
    | SimpleExpressionNode
    | InterpolationNode

// 属性节点
export interface AttributeNode {
    type: NodeTypes.ATTRIBUTE;
    name: string; // 属性名，比如 "id"
    value: TextNode | undefined; // 属性值，比如 "app"。也可能没有值（如 disabled）
}

// 元素节点
export interface ElementNode {
    type: NodeTypes.ELEMENT
    tag: string
    tagType: ElementTypes
    props: AttributeNode[],
    children: ASTNode[]
    isSelfClosing?: boolean
}

export interface TextNode {
    type: NodeTypes.TEXT
    content: string;
}

export interface RootNode {
    type: NodeTypes.ROOT;
    children: ASTNode[];
}

// 定义插件函数的类型
export type NodeTransform = (node: ASTNode, context: TransformContext) => void | (() => void);

// 定义 Transform 的配置项接口
export interface TransformOptions {
    nodeTransforms: NodeTransform[]
}

// ################# Transform 阶段 类型 #######################
// 定义 Transform 上下文接口 其实它就是一个传递函数的对象options
// 改进继承一个参数
export interface TransformContext extends TransformOptions {
    root: RootNode;         // 记录 AST 根节点
    currentNode: ASTNode | null; // 记录当前正在遍历的节点
    parent: ASTNode | null; // 记录当前节点的父节点
    childIndex: number // 记录当前节点在父节点 children 数组中的索引
}






