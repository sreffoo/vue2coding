import Dep, { popTarget, pushTarget } from "./dep"

let id = 0

// 每个属性都有一个dep（被观察者），watcher就是观察者
// 属性变化了通知观察者来更新 **观察者模式**
class Watcher{// 不同组件有不同watcher 目前就一个根实例的
    constructor(vm,expOrFn,options,cb) {
        this.id = id++
        this.renderWatcher = options// 是一个渲染watcher

        if(typeof expOrFn === 'string') {
            this.getter = function() {
                return vm[expOrFn]
            }
        }else {
            this.getter = expOrFn // getter意味着调用函数可以发生取值操作
        }

        this.deps = [] // watcher记住所有dep（计算属性、组件卸载等工作要用）
        this.depsId = new Set()
        this.lazy = options.lazy
        this.cb = cb // watch回调函数
        this.dirty = this.lazy// 缓存值
        this.vm = vm
        this.user = options.user// 标识是否是用户自己的watch

        this.value = this.lazy ? undefined : this.get()
    }
    addDep(dep) { // 一个组件 对应多个属性 重复的属性也不用记录
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this) // watcher已经记住了dep并且去重 此时让dep也记住watcher
        }
    }
    evaluate() {
        // 获取用户函数的返回值并标识为脏
        this.value = this.get()
        this.dirty = false
    }
    get() {
        // 类上增添一个静态属性 只有一份 全局变量 不需要通过实例调用(通过类) 所以不挂在原型上
        pushTarget(this)
        // TODO：为什么计算属性this会丢失
        let value = this.getter.call(this.vm) // 会去vm上取值 vm._update(vm._render())取值
        popTarget() // 渲染完毕后就清空 因为只有在模板里面的时候才会收集依赖 外部不收集
        return value
    }
    depend(){// watcher的depend是让watcher中的dep去depend
        let i = this.deps.length
        while(i--) {
            // 让计算属性watcher也收集渲染watcher
            this.deps[i].depend()
        }
    }
    update() {
        if (this.lazy) {
            // 如果是计算属性 依赖值变化 就标识计算属性是脏值
            this.dirty = true
        }else {
            // this.get() // 立即重新渲染
            queueWatcher(this) // 把当前watcher暂存起来
        }
    }
    run() {
        let oldValue = this.value
        let newValue = this.get() // 渲染的时候用最新的vm渲染 
        if (this.user) {
            this.cb.call(this.vm,newValue,oldValue)
        }
    }
}
let queue = []
let has = {}// 源码用的对象去重 可以用map更好
let pending = false // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q=>q.run())// 刷新过程中可能还会有新的watcher 放到下一批queue中
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {// watcher去重
        queue.push(watcher)
        has[id] = true
        // 不管update执行多少次 最终只执行一轮刷新操作
        if (!pending) {
            nextTick(flushSchedulerQueue, 0);
            pending = true
        }
    }
}

let callbacks = []
let waiting = false

function flushCallbacks() {
    let cbs = callbacks.slice(0)
    waiting = false
    callbacks = []
    cbs.forEach(cb=>cb())// 按照顺序依次执行
}

// 先采用promise（以前ie不兼容）=>MutationObserver(h5api)=>setImmediate(ie专享)=>setTimeout
// 优雅降级
let timerFunc
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
}else if(MutationObserver){
    let observer = new MutationObserver(flushCallbacks)// 回调会异步执行
    let textNode = document.createTextNode(1)
    observer.observe(textNode,{
        characterData:true
    })
    timerFunc = () => {
        textNode.textContent = 2
    }
}else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
}else {
    timerFunc = () => {
        setTimeout(flushCallbacks)
    }
}

// nextTick不是创建了一个异步任务，而是将这个任务维护到了队列中
export function nextTick(cb) {// **先内部还是先用户**
    callbacks.push(cb) // 维护nexttick中的callback方法
    if (!waiting) {
        timerFunc()
        waiting = true
    }
}

// 需要给每个属性增加一个dep,收集它所依赖的watcher
// 一个watcher(组件)可能多个dep(属性) 一个dep可能对应多个watcher 多对多关系
export default Watcher