import { initMixin } from "./init"

// es6的class会导致所有方法都耦合在一起
function Vue(options) {// options就是用户的选项
    this._init(options)
}

// 扩展init方法，引这个包的时候就会马上调用，马上执行函数
// 写第一行一样的
initMixin(Vue) 

export default Vue