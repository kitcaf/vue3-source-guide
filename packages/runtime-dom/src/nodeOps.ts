export function createElement(type: string): HTMLElement {
    return document.createElement(type)
}

export function insert(
    el: HTMLElement,
    parent: HTMLElement,
    anchor?: any): void {
    parent.appendChild(el)
}

export function createText(text: string): Text {
    return document.createTextNode(text);
}