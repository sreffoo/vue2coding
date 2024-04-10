// 重写数组的部分方法（变异方法）

// 获取数组原型
let oldArrayProto = Array.prototype

// 使得newArrayProto.__proto__ 指向 oldArrayProto  所以修改了他的方法还可以从原型拿到原来的方法
export let newArrayProto = Object.create(oldArrayProto)

let methods = [// 找到所有变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]// concat slice 都不会改变原数组

methods.forEach(method => {
    // 例如 arr.push(1,2,3)
    newArrayProto[method] = function(...args) {// 这里重写数组的方法
        // 内部调用的原方法 函数劫持 切片编程

        //TODO:...
        const result = oldArrayProto[method].call(this, ...args)// 这里this要改成arr的this push.call(arr)
        // console.log(method);

        // 如果新增的数据是对象，还需要继续劫持
        let inserted
        // this指向arr 也就是data
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':// arr.unshift(1,2,3)
                inserted = args
                break;
            case 'splice':// arr.splice(0,1,{a:1},{a:1})
                inserted = args.slice(2)
            default:
                break;
        }
        if(inserted) {
            // 对新增内容进行观测
            // 此时的this仍指向arr，Observer类里的data
            ob.observeArray(inserted)
        }

        ob.dep.notify() // 数组变化 通知对应watcher实现更新

        return result
    }
})