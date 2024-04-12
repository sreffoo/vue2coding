import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"

// es6的class会导致所有方法都耦合在一起
function Vue(options) {// options就是用户的选项
    console.log(options);
    this._init(options)
}

Vue.prototype.$nextTick = nextTick

// 扩展init方法，引这个包的时候就会马上调用，马上执行函数
// 写第一行一样的
initMixin(Vue) 
initLifeCycle(Vue)
initGlobalAPI(Vue)

Vue.prototype.$watch = function (expOrFn,cb) {
    // firstname / ()=>vm.firstname

    // firstname值变化了直接执行cb函数即可
    new Watcher(this,expOrFn,{user:true},cb)
}

export default Vue