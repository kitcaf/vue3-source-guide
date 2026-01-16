import { createRenderer, RendererOptions } from "@mini-vue/runtime-core";

// 基础节点
export interface CanvasNode {
    type: string;
    draw(ctx: any): void;
}

// 文本节点 (Canvas 中文本也是一种特殊的绘制对象)
export interface CanvasText extends CanvasNode {
    type: "TEXT";
    text: string;
}

// 元素节点 (如 Rect, Circle)
export interface CanvasElement extends CanvasNode {
    type: "ELEMENT";
    tag: string;
    x: number;
    y: number;
    color: string;
    // Canvas 是层级结构的，我们需要一个数组来存子节点
    children: CanvasNode[];
    // 允许动态属性赋值 (解决 patchProp 报错)
    [key: string]: any;
}

const canvasRenderOptions: RendererOptions<CanvasNode, CanvasElement> = {
    // 创建元素
    createElement(tag: string): CanvasElement {
        return {
            type: "ELEMENT",
            tag,
            x: 0,
            y: 0,
            color: "black", // 默认颜色
            children: [],

            // 核心：每个元素知道如何画自己
            draw(ctx: any) {
                // 先保存状态
                ctx.save();

                // 简单的绘制逻辑模拟
                ctx.fillStyle = this.color;
                if (tag === "rect") {
                    ctx.fillRect(this.x, this.y, 50, 50);
                } else if (tag === "circle") {
                    // 模拟画圆
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 25, 0, 2 * Math.PI);
                    ctx.fill();
                }

                // 递归绘制子节点 (Canvas 的层级渲染)
                this.children.forEach(child => child.draw(ctx));

                ctx.restore();
            }
        };
    },

    // 创建文本
    createText(text: string): CanvasText {
        return {
            type: "TEXT",
            text,
            draw(ctx: any) {
                ctx.fillText(this.text, 0, 0);
            }
        };
    },

    // 设置文本 (Canvas 比较特殊，这里简单模拟替换)
    setElementText(node: CanvasElement, text: string) {
        // 简单实现：把文本转成一个 Text 节点放入 children
        node.children = [{
            type: "TEXT",
            text,
            draw: (ctx) => ctx.fillText(text, 0, 0)
        } as CanvasText];
    },

    // 属性更新
    patchProp(el: CanvasElement, key: string, prevVal: any, nextVal: any) {
        // 比如更新 x, y, color
        el[key] = nextVal;
    },

    // 插入节点
    insert(child: CanvasNode, parent: CanvasElement) {
        parent.children.push(child);
    }
};

// 导出渲染器
export const renderer = createRenderer(canvasRenderOptions);