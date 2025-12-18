import { it, describe, expect } from "vitest"
import { reactive } from "../src/reactive";

describe("reactive test", () => {
    it("Object", () => {
        const original = { foo: 1 };
        const observed = reactive(original);
        expect(observed).not.toBe(original);
    })

})