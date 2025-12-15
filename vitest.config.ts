import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true, // 开启 describe, it, expect 全局变量
    },
    resolve: {
        alias: [
            {
                find: /@mini-vue\/(\w+)/,
                replacement: path.resolve(__dirname, 'packages/$1/src')
            }
        ]
    }
})