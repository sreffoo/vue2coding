import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

// es6的class会导致所有方法都耦合在一起
function Vue(options) {// options就是用户的选项
    // console.log(options);
    this._init(options)
}



// 写第一行一样的
initMixin(Vue)// 扩展init方法，引这个包的时候就会马上调用，马上执行函数
initLifeCycle(Vue)// vm._update vm._render
initGlobalAPI(Vue)// 全局API实现
initStateMixin(Vue)// 实现nextTick $watch

// -------------------测试-----------------------
let render1 = compileToFunction(`<ul style="color:red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`)
let vm1 = new Vue({data:{name:'wz'}})
let preVnode = render1.call(vm1)

let el = createElm(preVnode)
document.body.appendChild(el)

let render2 = compileToFunction(`<ul style="color:red;background:blue">
    <li key="b">b</li> 
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>
    <li key="c">c</li>
    <li key="q">q</li>
</ul>`)
let vm2 = new Vue({data:{name:'wz'}})
let nextVnode = render2.call(vm2)

// 原方法直接替换所有老的 diff算法比较区别后替换
// diff算法平级比较 放弃跨级比较（一般不会有跨级替换DOM的情况）节省性能

setTimeout(() => {
    // let newEl = createElm(nextVnode)
    // el.parentNode.replaceChild(newEl,el)

    patch(preVnode,nextVnode)
}, 1000);



export default Vue