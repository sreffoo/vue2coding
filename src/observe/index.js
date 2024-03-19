class Observer{
    
    constructor(data) {
        // Object.defineProperty只能劫持已经存在的属性（vue里会因此单独写一些api $set $delete）
        this.walk(data)
    }
    
    walk(data) {// 循环对象 对属性依次劫持
        // ’重新定义‘属性 vue2的性能瓶颈，vue3使用proxy明显提升
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))// 将数据定义为响应式的
    }
}

// ‘属性劫持’ 定义为公共api 后续可能供导出使用，因此没有写到类里面
export function defineReactive(target, key, value) {// 闭包 当前执行栈不销毁，get set都能拿到value
    
    // value可能又是一个对象，要对所有属性进行递归劫持（深度属性劫持）
    // 性能不怎么好
    observe(value)

    // 当更改值的时候也会暂存到value中，实现响应式？
    Object.defineProperty(target, key, {
        get() {// 取值的时候 会执行get
            return value
        },
        set(newValue) {// 修改的时候 会执行set
            if(newValue === value) return
            value = newValue
        }
    })
}

export function observe(data) {
    
    // 对这个对象进行劫持
    if(typeof data !== 'object' || data == null) {
        return // 只对对象进行劫持
    }

    // 如果一个对象被劫持了，就无需再次劫持（可以增添一个实例，用实例判断是否被劫持过）
    return new Observer(data)
}