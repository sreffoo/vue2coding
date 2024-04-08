// h() _c()
// @params {Object} data - 标签属性
export function createElementVNode(vm,tag,data,...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode(vm,tag,key,data,children)
}

// _v()
export function createTextVNode(vm,text) {
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

// ast是语法层面转化，描述语法本身（js css html）
// 虚拟DOM描述DOM元素 可以增加一些自定义(对象)属性来描述DOM
function vnode(vm,tag,key,data,children,text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
        // ...
    }
}