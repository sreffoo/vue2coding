export function initState(vm) {
    const opts = vm.$options// 获取所有的选项
    if (opts.data) {
        initData(vm)
    }
    // console.log(this);
}
function initData(vm) {
    let data = vm.$options.data // data可能是函数或对象

    // 不使用call的话data并没有作为对象的方法被调用
    data = typeof data === 'function' ? data.call(vm) : data
    // console.log(this);
}