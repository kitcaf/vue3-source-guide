export function createElement(type: string): HTMLElement {
    return document.createElement(type)
}

export function insert(
    el: HTMLElement,
    parent: HTMLElement,
    anchor?: any): void {
    if (anchor === null) {
        parent.appendChild(el)
    } else {
        parent.insertBefore(el, anchor)
    }
}

export function createText(text: string): Text {
    return document.createTextNode(text);
}

export function setElementText(el: HTMLElement, text: string) {
    el.textContent = text
}

export function remove(el: HTMLElement) {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}