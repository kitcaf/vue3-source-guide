import { defineConfig } from 'vitepress'

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
        sidebar: [
            {
                text: '一、环境与基础',
                collapsed: false, // 默认展开
                items: [
                    { text: '工程架构搭建', link: '/一、环境与基础/工程架构搭建' },
                    { text: '模块初始化', link: '/一、环境与基础/模块初始化' }
                ]
            },
            {
                text: '二、响应式系统',
                collapsed: false,
                items: [
                    {
                        text: '2.1 Reactivity 核心',
                        collapsed: false, // 子章节默认折叠，保持整洁
                        items: [
                            { text: '核心流程概述', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.1 Reactivity 核心' },
                            { text: '基础实现', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.2 Reactivity的基础实现' },
                            { text: 'Effect 返回 Runner', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.3 实现 effect 函数返回 runner' },
                            { text: 'Effect Stop 功能', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.4 实现 effect 的 stop 功能 & 优化 stop 功能' },
                            { text: '防止无限递归', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.5 effect防止死循环（无限递归）' },
                            { text: 'Scheduler 调度器', link: '/二、响应式系统/2.1 Reactivity 核心/2.1.6 实现 effect 的 scheduler 功能' },
                        ]
                    },
                    {
                        text: '2.2 扩展响应式对象',
                        collapsed: false,
                        items: [
                            { text: '工程化重构', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.1 工程化重构' },
                            { text: 'Readonly 功能', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.2 实现 readonly 功能' },
                            { text: '工具函数实现', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.3 实现 isReactive 和 isReadonly和isProxy' },
                            { text: '深层代理', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.4 深层代理' },
                            { text: '单例缓存机制', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.5 深层代理下的单例缓存机制' },
                            { text: 'Shallow 浅响应', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.6 实现 shallow功能（浅响应式）' },
                            { text: 'toRaw 实现', link: '/二、响应式系统/2.2 扩展响应式对象/2.2.7 实现 toRaw' },
                        ]
                    },
                    {
                        text: '2.3 Ref 系统',
                        collapsed: false,
                        items: [
                            { text: 'Ref 基础功能', link: '/二、响应式系统/2.3 Ref 系统/2.3.1 实现 ref 功能' },
                            { text: 'isRef & unRef', link: '/二、响应式系统/2.3 Ref 系统/2.3.2 实现 isRef 和 unRef 功能' },
                            { text: 'proxyR (自动解包)', link: '/二、响应式系统/2.3 Ref 系统/2.3.3 实现 proxyR' },
                            { text: 'toRef & toRefs', link: '/二、响应式系统/2.3 Ref 系统/2.3.4 实现 toRef & toRefs' },
                        ]
                    },
                    {
                        text: '2.4 Computed',
                        collapsed: false,
                        items: [
                            { text: '基础实现', link: '/二、响应式系统/2.4 Computed/2.4.1 基础实现' },
                            { text: '矛盾的选择', link: '/二、响应式系统/2.4 Computed/2.4.2 Computed 矛盾的选择' },
                        ]
                    }
                ]
            }
        ],

        // 社交链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/kitcaf/vue3-source-guide' }
        ]
    }
})