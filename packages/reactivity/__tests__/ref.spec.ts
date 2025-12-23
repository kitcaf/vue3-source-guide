import { describe, expect, it } from "vitest";
import { effect } from "../src/effect";
import { ref } from "../src/ref";

describe("ref", () => {
    it("reactive", () => {
        const a = ref(1);
        let dummy;
        let calls = 0;

        effect(() => {
            calls++;
            dummy = a.value;
        });

        // 1. 初始值
        expect(calls).toBe(1);
        expect(dummy).toBe(1);

        // 2. 修改值 -> 触发更新
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);

        // 3. 设置相同值 -> 不触发更新
        a.value = 2;
        expect(calls).toBe(2); // calls 应该还是 2
    });

    it("should make nested object reactive", () => {
        const a = ref({
            count: 1
        });
        let dummy;

        effect(() => {
            dummy = a.value.count;
        });

        expect(dummy).toBe(1);

        // 修改内部对象的属性，应该触发响应式
        // 这证明了 a.value 确实被转换成了 reactive 对象
        a.value.count = 2;
        expect(dummy).toBe(2);
    });
});