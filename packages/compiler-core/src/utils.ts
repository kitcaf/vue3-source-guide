import { advanceBy, ParserContext } from "./parse";

/**
 * 吃掉前面的空格
 */
export function advanceSpaces(context: ParserContext): void {
    const match = /^[\t\r\n\f ]+/.exec(context.source);
    if (match) {
        advanceBy(context, match[0].length);
    }
}