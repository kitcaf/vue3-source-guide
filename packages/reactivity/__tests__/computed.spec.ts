import { computed } from "../src/computed";
import { effect } from "../src/effect";
import { reactive } from "../src/reactive";
import { describe, expect, it, vi } from "vitest";
import { ref } from "../src/ref";

describe("computed", () => {
    it("should compute lazily", () => {
        const value = reactive({ foo: 1 });
        const getter = vi.fn(() => value.foo);
        const cValue = computed(getter);

        // 1. 懒执行：创建时不执行 getter
        expect(getter).not.toHaveBeenCalled();

        // 2. 访问时才执行
        expect(cValue.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1);

        // 3. 再次访问不执行 getter
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1);

        // 4. 依赖变化：不立刻执行，只是把 dirty 打开
        value.foo = 2;
        expect(getter).toHaveBeenCalledTimes(1);

        // 5. 重新执行
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);
    });

    it("should trigger effect", () => {
        const value = reactive({ foo: 1 });
        const cValue = computed(() => value.foo);
        let dummy;

        // effect 依赖 computed
        effect(() => {
            dummy = cValue.value;
        });
        expect(dummy).toBe(1);

        // 修改底层数据 -> computed 变脏 -> 触发外层 effect
        value.foo = 2;
        expect(dummy).toBe(2);
    });

    it("Example of branch switching", () => {
        const flag = ref(true)
        const a = ref(10)
        const b = ref(20)
        const c = computed(() => {
            return flag.value ? a.value : b.value
        })
        let dummy
        effect(() => {
            dummy = c.value
        })
        expect(dummy).toBe(10)
        flag.value = false
        expect(dummy).toBe(20)
        b.value = 40
        expect(dummy).toBe(40)
    });
});