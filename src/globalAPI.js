import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    // 静态方法 属性
    Vue.options = {
        _base: Vue// 存放Vue的构造函数
    };
    Vue.mixin = function (mixin) {
        // 将用户的选项和全局的options进行合并
        // {} {created:function(){}} => {created:[fn]}
        // {created:[fn]} {created:function(){}} => {created:[fn,fn]}
        this.options = mergeOptions(this.options, mixin);
        return this;
    };

    // 返回一个子类 且在子类上记录自己的选项
    Vue.extend = function(options) {
        // 根据用户的参数 返回一个构造函数
        function Sub(options = {}) {
            // 默认对子类进行初始化操作
            this._init(options)// 从原型链找到的_init
        }
        // Sub.prototype.__proto__ === Vue.prototype
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub// Object.create的bug
        // 希望将用户传递的参数和全局的Vue.options合并
        Sub.options = mergeOptions(Vue.options,options)// 保存用户传递的选项
        return Sub
    }
    Vue.options.components ={}

    // 收集全局的定义id和对应的definition
    Vue.component = function(id,definition) {
        // 如果definition已经是一个函数 说明用户自己调用了Vue.extend
        definition = typeof definition === 'function' ? definition : Vue.extend(definition)
        Vue.options.components[id] = definition
    }
}
