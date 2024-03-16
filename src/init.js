import { initState } from "./state"

export function initMixin(Vue) {// 给Vue增加init方法
    // console.log(this);
    Vue.prototype._init = function(options) {// 用于初始化操作
        // vm.$options 就是获取用户的配置
        // $都是实例上自己的属性$nextTick $data等
        // 假如在data里面初始化一个$name，无法通过vm.$name拿到
        const vm = this
        vm.$options = options// 将用户的选项挂载到实例上

        // 初始化状态
        initState(vm)
        // ...
        // console.log(this);
    }
}