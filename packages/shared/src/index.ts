export * from "../src/shapeFlags";

export const extend = Object.assign

// 判断是否是对象
export function isObject(val: any) {
    return val != null && typeof val === 'object'
}

//判断两个变量是否一样
export function hasChanged(value: any, oldValue: any) {
    return !Object.is(value, oldValue)
}

// 判断是否以 on 开头，且第三个字符是大写
export const inOn = (key: string) => /^on[A-Z]/.test(key);

//判断对象本身是否有该属性 (不查找原型链)
export const hasOwn = (object: object, key: string | symbol) => Object.prototype.hasOwnProperty.call(object, key)

export const isArray = Array.isArray;
