import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { nextTick } from "./observe/watcher"

// es6的class会导致所有方法都耦合在一起
function Vue(options) {// options就是用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick

// 扩展init方法，引这个包的时候就会马上调用，马上执行函数
// 写第一行一样的
initMixin(Vue) 
initLifeCycle(Vue)
initGlobalAPI(Vue)


export default Vue