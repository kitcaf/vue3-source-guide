## 项目介绍 | project introduction

本项目是笔者在**深入构建 mini Vue 3 过程中的实战记录与详细文档**。

写在前面：由于个人水平有限（**但是一定保证精简核心，让大家都有收获**），且 Vue 源码博大精深，本项目中的代码实现或文档理解难免会有偏差甚至错误。 如果您在阅读过程中发现任何问题，或者有更好的实现思路，非常热烈地欢迎您提交 Issue 或 Pull Request 指正。您的每一次反馈，都是对我们共同进步的巨大帮助！

## 学习路线 | Roadmap

本项目严格按照 Vue 3 的三大核心模块进行拆解，你可以按照以下目录顺序进行学习：

- Phase 1: 环境与基础 (Infrastructure)
- Phase 2: 响应式系统 (Reactivity)
- Phase 3: 运行时核心 (Runtime-Core)
- Phase 4: 编译器 (Compiler)
- Phase 5: 打包与收尾 (Bundling)

## 项目目录 | project directory

持续更新中...

> 目录生成工具：https://github.com/kitcaf/repotoc
<!--toc-->
- 一、环境与基础
  - [1.1 工程架构搭建](docs/%E4%B8%80%E3%80%81%E7%8E%AF%E5%A2%83%E4%B8%8E%E5%9F%BA%E7%A1%80/1.1%20%E5%B7%A5%E7%A8%8B%E6%9E%B6%E6%9E%84%E6%90%AD%E5%BB%BA.md)
  - [1.2 模块初始化](docs/%E4%B8%80%E3%80%81%E7%8E%AF%E5%A2%83%E4%B8%8E%E5%9F%BA%E7%A1%80/1.2%20%E6%A8%A1%E5%9D%97%E5%88%9D%E5%A7%8B%E5%8C%96.md)
- 二、响应式系统
  - 2.1 Reactivity 核心
    - [reactivity 的核心流程](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.1%20Reactivity%20%E6%A0%B8%E5%BF%83.md)
    - [Reactivity的基础实现](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.2%20Reactivity%E7%9A%84%E5%9F%BA%E7%A1%80%E5%AE%9E%E7%8E%B0.md)
    - [实现 effect 函数返回 runner](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.3%20%E5%AE%9E%E7%8E%B0%20effect%20%E5%87%BD%E6%95%B0%E8%BF%94%E5%9B%9E%20runner.md)
    - [实现 effect 的 stop 功能 & 优化 stop 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.4%20%E5%AE%9E%E7%8E%B0%20effect%20%E7%9A%84%20stop%20%E5%8A%9F%E8%83%BD%20&%20%E4%BC%98%E5%8C%96%20stop%20%E5%8A%9F%E8%83%BD.md)
    - [effect防止死循环（无限递归）](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.5%20effect%E9%98%B2%E6%AD%A2%E6%AD%BB%E5%BE%AA%E7%8E%AF%EF%BC%88%E6%97%A0%E9%99%90%E9%80%92%E5%BD%92%EF%BC%89.md)
    - [实现 effect 的 scheduler 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/2.1.6%20%E5%AE%9E%E7%8E%B0%20effect%20%E7%9A%84%20scheduler%20%E5%8A%9F%E8%83%BD.md)
  - 2.2 扩展响应式对象
    - [工程化重构](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.1%20%E5%B7%A5%E7%A8%8B%E5%8C%96%E9%87%8D%E6%9E%84.md)
    - [实现 readonly 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.2%20%E5%AE%9E%E7%8E%B0%20readonly%20%E5%8A%9F%E8%83%BD.md)
    - [实现 isReactive 和 isReadonly和isProxy](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.3%20%E5%AE%9E%E7%8E%B0%20isReactive%20%E5%92%8C%20isReadonly%E5%92%8CisProxy.md)
    - [实现 reactive 和 readonly 嵌套对象转换功能 - 深层代理](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.4%20%E6%B7%B1%E5%B1%82%E4%BB%A3%E7%90%86.md)
    - [实现 shallow功能（浅响应式）](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.5%20%E6%B7%B1%E5%B1%82%E4%BB%A3%E7%90%86%E4%B8%8B%E7%9A%84%E5%8D%95%E4%BE%8B%E7%BC%93%E5%AD%98%E6%9C%BA%E5%88%B6.md)
    - [实现 shallow功能（浅响应式）](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.6%20%E5%AE%9E%E7%8E%B0%20shallow%E5%8A%9F%E8%83%BD%EF%BC%88%E6%B5%85%E5%93%8D%E5%BA%94%E5%BC%8F%EF%BC%89.md)
    - [实现 toRaw](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.2%20%E6%89%A9%E5%B1%95%E5%93%8D%E5%BA%94%E5%BC%8F%E5%AF%B9%E8%B1%A1/2.2.7%20%E5%AE%9E%E7%8E%B0%20toRaw.md)
  - 2.3 Ref 系统
    - [3.1 实现 ref 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.3%20Ref%20%E7%B3%BB%E7%BB%9F/2.3.1%20%E5%AE%9E%E7%8E%B0%20ref%20%E5%8A%9F%E8%83%BD.md)
    - [实现 isRef 和 unRef 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.3%20Ref%20%E7%B3%BB%E7%BB%9F/2.3.2%20%E5%AE%9E%E7%8E%B0%20isRef%20%E5%92%8C%20unRef%20%E5%8A%9F%E8%83%BD.md)
    - [实现 proxyR](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.3%20Ref%20%E7%B3%BB%E7%BB%9F/2.3.3%20%E5%AE%9E%E7%8E%B0%20proxyR.md)
    - [实现 toRef & toRefs](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.3%20Ref%20%E7%B3%BB%E7%BB%9F/2.3.4%20%E5%AE%9E%E7%8E%B0%20toRef%20&%20toRefs.md)
  - 2.4 Computed
    - [基础实现](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.4%20Computed/2.4.1%20%E5%9F%BA%E7%A1%80%E5%AE%9E%E7%8E%B0.md)
    - [Computed 矛盾的选择](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.4%20Computed/2.4.2%20Computed%20%E7%9F%9B%E7%9B%BE%E7%9A%84%E9%80%89%E6%8B%A9.md)
- 三、运行时
  - 3.1 概述
    - [3.1.1 运行时概述](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.1%20%E6%A6%82%E8%BF%B0/3.1%20%E8%BF%90%E8%A1%8C%E6%97%B6%E6%A6%82%E8%BF%B0%E3%80%90%E9%87%8D%E8%A6%81%E3%80%91.md)
  - 3.2 初始化流程
    - [3.2.1 runtime-core 流程概览 & `createApp` 入口](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.1%20runtime-core%20%E6%B5%81%E7%A8%8B%E6%A6%82%E8%A7%88%20&%20createApp%20%E5%85%A5%E5%8F%A3.md)
    - [3.2.2 实现createVNode（很重要）](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.2%20%E5%AE%9E%E7%8E%B0%20createRenderer.md)
    - [3.2.3 实现 `createRenderer` (渲染器工厂函数)](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.3%20%E5%AE%9E%E7%8E%B0%20createRenderer%20(%E6%B8%B2%E6%9F%93%E5%99%A8%E5%B7%A5%E5%8E%82%E5%87%BD%E6%95%B0)%20.md)
    - [3.2.4 完善 VNode (ShapeFlags)](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.4%20%E5%AE%8C%E5%96%84%20VNode%20(ShapeFlags).md)
    - [3.2.5 实现初始化 component 主流程](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.5%20%E5%AE%9E%E7%8E%B0%E5%88%9D%E5%A7%8B%E5%8C%96%20component%20%E4%B8%BB%E6%B5%81%E7%A8%8B.md)
    - [3.2.6 实现初始化 element 主流程](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.6%20%E5%AE%9E%E7%8E%B0%E5%88%9D%E5%A7%8B%E5%8C%96%20element%20%E4%B8%BB%E6%B5%81%E7%A8%8B.md)
    - [3.2.7 基础实现 runtime-dom](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.7%20%E5%9F%BA%E7%A1%80%E5%AE%9E%E7%8E%B0%20runtime-dom.md)
    - [3.2.8 注册事件功能 (处理 @click)](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.8%20%E6%B3%A8%E5%86%8C%E4%BA%8B%E4%BB%B6%E5%8A%9F%E8%83%BD%20(%E5%A4%84%E7%90%86%20@click).md)
    - [3.2.10 实现自定义渲染器 custom renderer](docs/%E4%B8%89%E3%80%81%E8%BF%90%E8%A1%8C%E6%97%B6/3.2%20%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B/3.2.9%20%E5%AE%9E%E7%8E%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%E5%99%A8%20custom%20renderer.md)
- [index](docs/index.md)

<!--tocEnd:offset=42-->


## 致谢 | Acknowledgements

* **[cuixiaorui/mini-vue](https://github.com/cuixiaorui/mini-vue?tab=MIT-1-ov-file)**
* **[Vue.js Core](https://github.com/vuejs/core)**:

## 版权声明 | License

* **代码(/packages)**：遵循 [MIT License](./LICENSE-CODE) 协议
* **文档(/docs)**：遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议

