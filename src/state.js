import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

export function initState(vm) {
    const opts = vm.$options// 获取所有的选项
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch
    for(let key in watch) {
        const handler = watch[key]// 字符串 数组 函数
        if(Array.isArray(handler)) {
            for(let i = 0; i < handler.length;i++) {
                createWatch(vm,key,handler[i])
            }
        }else {
            createWatch(vm,key,handler)
        }
    }
}

function createWatch(vm,key,handler) {
    // 字符串 数组 函数
    if(typeof handler == 'string') {
        handler = vm[handler]
    }
    return vm.$watch(key,handler)
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

function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}
    for (let key in computed) {
        let userDef = computed[key]
        // 监控计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get
        // 如果直接new Watcher默认就会执行fn 将属性和watcher对应起来
        watchers[key] = new Watcher(vm,fn,{lazy:true})

        defineComputed(vm,key,userDef)
    }
}
function defineComputed(target,key,userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (()=>{})

    // 可以通过实例拿到对应的属性
    Object.defineProperty(target,key,{
        get:createComputedGetter(key),
        set:setter
    })
}

// Vue2计算属性不会收集依赖 只会让自己的依赖属性收集依赖
function createComputedGetter(key) {
    // 检测是否执行这个getter
    return function (){
        // ****createComputedGetter作为target的get调用****
        // js规范this指向target而不是target[key]
        const watcher = this._computedWatchers[key]// 获取对应watcher
        // 多次取值只有第一次是脏的
        if(watcher.dirty){
            // 如果是脏的就去执行 用户传入的函数
            watcher.evaluate()
        }
        if(Dep.target) {
            // 计算属性出栈后还要渲染watcher 让计算属性watcher里属性收集上一层watcher
            watcher.depend()
        }
        return watcher.value
    }
}