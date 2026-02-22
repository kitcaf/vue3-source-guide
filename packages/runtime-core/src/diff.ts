// 求最长递增子序列的索引 (贪心 + 二分查找)
/**
 * 记录一下由谁转换的就可以
 * p数组：p[i] 表示长度为 i 的最小值的下标，p 里面的下标所指向的原数组的值，一定是严格单调递增的
 * result：记录result[i] i元素在进入对应的长度时，排在它之前的元素是什么
原因是p数组只能详细长度不能相信里面的元素
假设我们的旧节点在新列表里的索引是 [2, 3, 1]。
先看到 2，放进去：[2]
看到 3，比 2 大，放进去：[2, 3]
看到 1，为了后续可能接更多的数，会贪心地用 1 把 2 替换掉，变成了：[1, 3]
 */
// 最终返回的是 arr的最长递增子序列的下标序列
function getSequence(arr: number[]): number[] {
    const result = arr.slice();
    const p = [0]; //0表示新增，其他数都是大于0的
    let i, j, l, r, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i]; //遍历这个元素
        if (arrI !== 0) { // 0表示新增不用管
            j = p[p.length - 1]; // 如果比比我目前p里的最后一个元素还要大，说明可以直接
            // 增长一个序列，否则就去二分去更新p序列
            // 
            if (arr[j] < arrI) {
                result[i] = j;
                p.push(i);
                continue;
            }

            // 二分
            l = 0;
            r = p.length - 1;
            while (l < r) {
                c = (l + r) >> 1;
                if (arr[p[c]] < arrI) {
                    l = c + 1;
                } else {
                    r = c;
                }
            }
            if (arrI < arr[p[l]]) {
                if (l > 0) {
                    result[i] = p[l - 1];
                }
                p[l] = i;
            }
        }
    }

    // 从长度最大的p数组中拿到对应的下标
    l = p.length;
    r = p[l - 1];
    while (l-- > 0) {
        p[l] = r;
        r = result[r];
    }
    return p;
}