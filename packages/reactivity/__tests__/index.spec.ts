import { describe, it, expect } from 'vitest';
import { hello } from '@mini-vue/reactivity';

describe('reactivity/index', () => {
    it('init test', () => {
        expect(hello()).toBe("hello miniVue")
    });
});