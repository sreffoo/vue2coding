import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";



export function initLifeCycle(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this
        const el = vm.$el

        // patch既有初始化功能 也有更新的功能
        // 返回最新的el
        vm.$el = patch(el,vnode)
    }
    // _c('div',{},...children)
    Vue.prototype._c = function() {
        return createElementVNode(this,...arguments)
    }
    // _v(text)
    Vue.prototype._v = function() {
        return createTextVNode(this,...arguments)
    }
    Vue.prototype._s = function(value) {
        if (typeof value !== 'object') {
            return value
        }
        return JSON.stringify(value)
    }
    Vue.prototype._render = function() {
        const vm = this
        // 不callvm的话this指向$options 让with中的this指向vm
        return vm.$options.render.call(vm)// 通过ast语法转义后生成的render方法
        // 当渲染的时候就会去实例中取值，就可以将属性和视图绑定一起
    }
}

export function mountComponent(vm, el) {
    // 这里的el是通过querySelector处理过的 options的没处理过
    vm.$el = el

    // 1.调用render方法产生虚拟节点 虚拟DOM
    const updateComponent = ()=>{
        vm._update(vm._render()) // vm.$options.render() 返回虚拟节点
    }
    const watcher = new Watcher(vm,updateComponent,true)// true用于标识是一个渲染watcher
    // console.log(watcher);
    // 2.根据虚拟节点产生真实DOM

    // 3.插入到el元素中
}

// Vue核心流程 1、创造了响应式数据 2、模板转化为ast语法树
// 3、将ast转化为render函数（为虚拟节点做准备，因为每次重新渲染用正则替换消耗很大）
// 4、后续每次数据更新可以只执行render函数，无需再次执行ast转化过程
// render函数会去产生虚拟DOM（使用响应式数据）
// 根据生成的虚拟DOM创造真实DOM

export function callHook(vm,hook) {// 调用钩子函数
    const handlers = vm.$options[hook]
    if(handlers) {
        handlers.forEach(handlers=>handlers.call(vm))
    }
}