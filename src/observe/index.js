import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer{// 用于观测，观测的方法都写在里面
    
    constructor(data) {
        // 给每个对象都增加收集功能(所有对象)
        this.dep = new Dep()

        // Object.defineProperty只能劫持已经存在的属性（vue里会因此单独写一些api $set $delete）
        
        // 自定义一个属性放this 同时给数据加了标识，有则说明被观测过
        // 如果写data.__ob__ = this 若data是对象会造成死循环
        // 因此不能在循环时遍历这个属性
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false// 不可枚举 循环时不可获取
        })

        if(Array.isArray(data)) {
            // 在保留数组原方法的情况下重写数组中的方法 7个变异方法    
            data.__proto__ = newArrayProto
            this.observeArray(data)
        }else {
            this.walk(data)
        }
    }
    walk(data) {// 循环对象 对属性依次劫持
        // ’重新定义‘属性 vue2的性能瓶颈，vue3使用proxy明显提升
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))// 将数据定义为响应式的
    }
    observeArray(data) {// 对数组中的对象劫持 不劫持所有元素
        data.forEach(item => observe(item))
    }
}

// 深层次嵌套递归多了性能差 不存在的属性监控不到 存在的属性要重写方法
// 因此Vue3采用proxy
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if (Array.isArray(current)) {
            dependArray(current)
        }        
    }
}

// ‘属性劫持’ 定义为公共api 后续可能供导出使用，因此没有写到类里面
export function defineReactive(target, key, value) {// 闭包 当前执行栈不销毁，get set都能拿到value
    
    // value可能又是一个对象，要对所有属性进行递归劫持（深度属性劫持）
    // 性能不怎么好
    let childOb = observe(value)// childOb.dep用来收集依赖

    let dep = new Dep() //每个属性都有dep(因为value有闭包,这里不会销毁)

    // 当更改值的时候也会暂存到value中，实现响应式？
    Object.defineProperty(target, key, {
        get() {// 取值的时候 会执行get
            if (Dep.target) {
                // 用到的属性才会收集依赖 但是每个属性都有Dep ****
                dep.depend()// 让这个属性的收集器记住当前的watcher
                if(childOb) {
                    // 让数组和对象本身实现依赖收集
                    childOb.dep.depend()
                    // 处理数组里的嵌套数组
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {// 修改的时候 会执行set
            if(newValue === value) return
            // set的值可能又是一个对象 再次代理
            observe(newValue)
            value = newValue
            dep.notify() // 通知更新
        }
    })
}

export function observe(data) {
    
    // 对这个对象进行劫持
    if(typeof data !== 'object' || data == null) {
        return // 只对对象进行劫持
    }
    if(data.__ob__ instanceof Observer) {
        // 如果这个属性是Observer的实例 说明被代理过了
        // 直接返回他的实例
        return data.__ob__
    }
    // 如果一个对象被劫持了，就无需再次劫持（可以增添一个实例，用实例判断是否被劫持，如上）
    return new Observer(data)
}