import Dep from "./dep"

let id = 0

// 每个属性都有一个dep（被观察者），watcher就是观察者
// 属性变化了通知观察者来更新 **观察者模式**
class Watcher{// 不同组件有不同watcher 目前就一个根实例的
    constructor(vm,fn,options) {
        this.id = id++
        this.renderWatcher = options// 是一个渲染watcher
        this.getter = fn // getter意味着调用函数可以发生取值操作
        this.deps = [] // watcher记住所有dep（计算属性、组件卸载等工作要用）
        this.depsId = new Set()
        this.get()
    }
    addDep(dep) { // 一个组件 对应多个属性 重复的属性也不用记录
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this) // watcher已经记住了dep并且去重 此时让dep也记住watcher
        }
    }
    get() {
        // 类上增添一个静态属性 只有一份 全局变量 不需要通过实例调用(通过类) 所以不挂在原型上
        Dep.target = this
        this.getter() // 会去vm上取值 vm._update(vm._render())取值
        Dep.target = null // 渲染完毕后就清空 因为只有在模板里面的时候才会收集依赖 外部不收集
    }
    update() {
        this.get() // 重新渲染
    }
}

// 需要给每个属性增加一个dep,收集它所依赖的watcher
// 一个watcher(组件)可能多个dep(属性) 一个dep可能对应多个watcher 多对多关系
export default Watcher