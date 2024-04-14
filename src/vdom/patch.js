import { isSameVnode } from ".";

// 创建真实DOM
export function createElm(vnode) {
    let {tag,data,children,text} = vnode
    if (typeof tag === 'string') {// 标签
        vnode.el = document.createElement(tag) //将真实和虚拟DOM对应
        patchProps(vnode.el,{},data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        });
    }else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 处理属性
export function patchProps(el,oldProps = {},props = {}) {
    // console.log(oldProps);
    // 老的属性中有要删除的
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    
    // 删除样式
    for (let key in oldStyles) {
        if(!newStyles[key]) {
            el.style[key] = ''
        }
    }

    // 删除属性
    for (let key in oldProps) {
        if(!props[key]) {
            el.removeAttribute[key]
        }
    }

    for (let key in props) {// 用新的覆盖老的
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        }else {
            el.setAttribute(key,props[key])
        }
    }
}

export function patch(oldVNode,vnode) {
    // 初渲染流程
    const isRealElement = oldVNode.nodeType
    if (isRealElement) {
        const elm = oldVNode // 获取真实元素
        const parentElm = elm.parentNode // 拿到父元素
        let newElm = createElm(vnode)
        parentElm.insertBefore(newElm,elm.nextSibling)
        parentElm.removeChild(elm)// 删除老节点

        return newElm
    }else {
        // diff算法

        // 1.两个节点不同（节点tag、key是否都相同） 直接删除老的换新的（无比对）
        // 2.节点相同 比较节点的属性是否有差异（复用老节点，将差异的属性更新）
        // 3.节点比较完后比较两人的儿子
        return patchVnode(oldVNode,vnode)
    }
}

function patchVnode(oldVNode,vnode) {

    // 节点不同 // 替换真实DOM
    if (!isSameVnode(oldVNode,vnode)) {
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el,oldVNode.el)
        return el// 保证返回的是新节点
    }

    // 节点相同 复用老节点元素
    let el = vnode.el = oldVNode.el
    // 处理文本
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.tex// 覆盖老文本
        }
    }

    // 是标签 比对标签的属性
    patchProps(el,oldVNode.data,vnode.data)

    // 比较儿子
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []

    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整diff算法 比较两个儿子
        updateChildren(el,oldChildren,newChildren)
    }else if (newChildren.length > 0) {
        // 没有老的有新的
        mountChildren(el,newChildren)
    }else if (oldChildren.length > 0) {
        // 有老的没新的
        el.innerHTML = ''// 简写 可以循环删除
    }

    // console.log(oldVNode,vnode);

    return el
}

function mountChildren(el,newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

function updateChildren(el,oldChildren,newChildren) {
    // Vue2通过双指针比较节点
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    // 任意一方头指针大于尾指针停止循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (isSameVnode(oldStartVnode,newStartVnode)) {
            patchVnode(oldStartVnode,newStartVnode)// 相同节点递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    if(newStartIndex <= newEndIndex) {// 新的多余的插入
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i]);
            el.appendChild(childEl)
        }
    }
    if(oldStartIndex <= oldEndIndex) {// 老的多余的删除
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let childEl = oldChildren[i].el;
            el.removeChild(childEl)
        }
    }

    console.log(oldStartVnode,newStartVnode,oldEndVnode,newEndVnode);
}