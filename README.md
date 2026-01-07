## 项目介绍 | project introduction

本项目是笔者在深入学习 Vue 3 源码过程中的实战记录与总结。

写在前面： 由于个人水平有限，且 Vue 源码博大精深，本项目中的代码实现或文档理解难免会有偏差甚至错误。 如果您在阅读过程中发现任何问题，或者有更好的实现思路，非常热烈地欢迎您提交 Issue 或 Pull Request 指正。您的每一次反馈，都是对我们共同进步的巨大帮助！

## 学习路线 | Roadmap

本项目严格按照 Vue 3 的三大核心模块进行拆解，你可以按照以下目录顺序进行学习：

- Phase 1: 环境与基础 (Infrastructure)
- Phase 2: 响应式系统 (Reactivity)
- Phase 3: 运行时核心 (Runtime-Core)
- Phase 4: 编译器 (Compiler)
- Phase 5: 打包与收尾 (Bundling)

## 项目目录 | project directory

> 目录生成工具：https://github.com/kitcaf/repotoc
<!--toc-->
- 一、环境与基础
  - [工程架构搭建](docs/%E4%B8%80%E3%80%81%E7%8E%AF%E5%A2%83%E4%B8%8E%E5%9F%BA%E7%A1%80/%E5%B7%A5%E7%A8%8B%E6%9E%B6%E6%9E%84%E6%90%AD%E5%BB%BA.md)
  - [模块初始化](docs/%E4%B8%80%E3%80%81%E7%8E%AF%E5%A2%83%E4%B8%8E%E5%9F%BA%E7%A1%80/%E6%A8%A1%E5%9D%97%E5%88%9D%E5%A7%8B%E5%8C%96.md)
- 二、响应式系统
  - 2.1 Reactivity 核心
    - [reactivity 的核心流程](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/Reactivity%20%E6%A0%B8%E5%BF%83.md)
    - [Reactivity的基础实现](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/Reactivity%E7%9A%84%E5%9F%BA%E7%A1%80%E5%AE%9E%E7%8E%B0.md)
    - [实现 effect 函数返回 runner](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/%E5%AE%9E%E7%8E%B0%20effect%20%E5%87%BD%E6%95%B0%E8%BF%94%E5%9B%9E%20runner.md)
    - [实现 effect 的 stop 功能 & 优化 stop 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/%E5%AE%9E%E7%8E%B0%20effect%20%E7%9A%84%20stop%20%E5%8A%9F%E8%83%BD%20&%20%E4%BC%98%E5%8C%96%20stop%20%E5%8A%9F%E8%83%BD.md)
    - [effect防止死循环（无限递归）](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/effect%E9%98%B2%E6%AD%A2%E6%AD%BB%E5%BE%AA%E7%8E%AF%EF%BC%88%E6%97%A0%E9%99%90%E9%80%92%E5%BD%92%EF%BC%89.md)
    - [实现 effect 的 scheduler 功能](docs/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F/2.1%20Reactivity%20%E6%A0%B8%E5%BF%83/%E5%AE%9E%E7%8E%B0%20effect%20%E7%9A%84%20scheduler%20%E5%8A%9F%E8%83%BD.md)

<!--tocEnd:offset=12-->

## 致谢 | Acknowledgements

* **[cuixiaorui/mini-vue](https://github.com/cuixiaorui/mini-vue?tab=MIT-1-ov-file)**
* **[Vue.js Core](https://github.com/vuejs/core)**:

## 版权声明 | License

* **代码(/packages)**：遵循 [MIT License](./LICENSE-CODE) 协议
* **文档(/docs)**：遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议


    


