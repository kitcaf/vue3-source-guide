export interface Component {
    render?: Function, //组件的render
    setup?: Function, // vue模板中script脚本中的返回的setup(或者语法糖)
    [key: string]: any, //允许其他类型
}


