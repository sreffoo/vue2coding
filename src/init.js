import { compileToFunction } from "./compiler"
import { mountComponent } from "./lifecycle"
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
        
        if(options.el) {
            vm.$mount(options.el) // 数据挂载
        }
    }

    Vue.prototype.$mount = function(el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if(!ops.render) { // 先进行查找有没有render函数
            let template // 没有render看是否写template，没写就用外部的template
            if(!ops.template && el) { // 没写模板，但写了el
                template = el.outerHTML
            }else {
                if(el) {
                    // 如果有el 采用模板内容
                    template = ops.template
                }
            }
            if(template) {
                // 这里需要对模板进行编译
                const render = compileToFunction(template)
                ops.render = render
            }
        }
        // console.log(ops.render) // 最终就可以获取render方法
        mountComponent(vm, el)


        // script标签引用的vue.global.js的话，这个编译过程在浏览器运行
        // runtime不包含模板编译（options中的那个），因此用runtime的时候不能用template
        // 整个编译是打包时通过loader转移.vue文件的
    }
}