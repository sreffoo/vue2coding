let id = 0

class Dep{
    constructor() {
        this.id = id++ // 属性的dep要收集watcher
        this.subs = [] // 存放当前属性对应的watcher有哪些
    }
    depend() {
        // 这里不希望放重复的watcher
        Dep.target.addDep(this) // dep传给watcher 让watcher先记住dep

        // dep和watcher是多对多的关系
        // 一个属性可以在多个组件中使用 dep => 多个watcher
        // 一个组件中由多个属性组成 watcher => 多个dep
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())// 告诉watcher要更新了
    }
}
Dep.target = null // 全局变量

let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep