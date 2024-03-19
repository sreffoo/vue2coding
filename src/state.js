import { observe } from "./observe/index"

export function initState(vm) {
    const opts = vm.$options// 获取所有的选项
    if (opts.data) {
        initData(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data // data可能是函数或对象

    // 不使用call的话data并没有作为对象的方法被调用
    data = typeof data === 'function' ? data.call(vm) : data // data是用户返回的对象
    
    //TODO: 为什么要有这一句才能在vm上观测到劫持
    // 将返回的对象放到了_data
    vm._data = data 

    // 对数据进行劫持 defineProperty
    observe(data)

    // 将vm._data 用vm代理，方便用户取值
    for (let key in data) {
        proxy(vm,'_data',key)
    }
}