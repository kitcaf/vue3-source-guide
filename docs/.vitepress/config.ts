import { defineConfig } from 'vitepress'
import { sidebar } from "./sidebar"

export default defineConfig({
    // 网站标题
    title: "Vue3 Source Guide",
    description: "从零手写 Vue3 源码的保姆级教程",

    base: '/vue3-source-guide/',


    themeConfig: {
        // 顶部导航
        nav: [
            { text: '首页', link: '/' },
            { text: 'GitHub', link: 'https://github.com/你的用户名/vue3-source-guide' }
        ],

        // 侧边栏配置 (核心)
        sidebar: sidebar,

        // 社交链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/kitcaf/vue3-source-guide' }
        ]
    }
})