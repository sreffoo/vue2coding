export function initLifeCycle(Vue) {
    Vue.prototype._update = function() {
        console.log('update');
    }
    Vue.prototype._render = function() {
        console.log('render');
    }
}

export function mountComponent(vm, el) {
    // 1.调用render方法产生虚拟节点 虚拟DOM

    vm._update(vm._render()) // vm.$options.render() 返回虚拟节点

    // 2.根据虚拟节点产生真实DOM

    // 3.插入到el元素中
}

// Vue核心流程 1、创造了响应式数据 2、模板转化为ast语法树
// 3、将ast转化为render函数（为虚拟节点做准备，因为每次重新渲染用正则替换消耗很大）
// 4、后续每次数据更新可以只执行render函数，无需再次执行ast转化过程
// render函数会去产生虚拟DOM（使用响应式数据）
// 根据生成的虚拟DOM创造真实DOM