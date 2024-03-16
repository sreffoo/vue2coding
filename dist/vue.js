(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项
      if (opts.data) {
        initData(vm);
      }
      // console.log(this);
    }
    function initData(vm) {
      var data = vm.$options.data; // data可能是函数或对象

      // 不使用call的话data并没有作为对象的方法被调用
      data = typeof data === 'function' ? data.call(vm) : data;
      // console.log(this);
    }

    function initMixin(Vue) {
      // 给Vue增加init方法
      // console.log(this);
      Vue.prototype._init = function (options) {
        // 用于初始化操作
        // vm.$options 就是获取用户的配置
        // $都是实例上自己的属性$nextTick $data等
        // 假如在data里面初始化一个$name，无法通过vm.$name拿到
        var vm = this;
        vm.$options = options; // 将用户的选项挂载到实例上

        // 初始化状态
        initState(vm);
        // ...
        // console.log(this);
      };
    }

    // es6的class会导致所有方法都耦合在一起
    function Vue(options) {
      // options就是用户的选项
      this._init(options);
    }

    // 扩展init方法，引这个包的时候就会马上调用，马上执行函数
    initMixin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
