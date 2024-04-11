import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    // 静态方法 属性
    Vue.options = {};
    Vue.mixin = function (mixin) {
        // 将用户的选项和全局的options进行合并
        // {} {created:function(){}} => {created:[fn]}
        // {created:[fn]} {created:function(){}} => {created:[fn,fn]}
        this.options = mergeOptions(this.options, mixin);
        return this;
    };
}
