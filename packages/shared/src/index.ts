export const extend = Object.assign

// 判断是否是对象
export function isObject(val: any) {
    return val != null && typeof val === 'object'
}