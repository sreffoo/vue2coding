import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state";

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


export default Vue