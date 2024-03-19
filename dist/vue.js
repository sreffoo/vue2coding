(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : String(i);
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.defineProperty只能劫持已经存在的属性（vue里会因此单独写一些api $set $delete）
      this.walk(data);
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // ’重新定义‘属性 vue2的性能瓶颈，vue3使用proxy明显提升
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        }); // 将数据定义为响应式的
      }
    }]);
    return Observer;
  }(); // ‘属性劫持’ 定义为公共api 后续可能供导出使用，因此没有写到类里面
  function defineReactive(target, key, value) {
    // 闭包 当前执行栈不销毁，get set都能拿到value

    // value可能又是一个对象，要对所有属性进行递归劫持（深度属性劫持）
    // 性能不怎么好
    observe(value);

    // 当更改值的时候也会暂存到value中，实现响应式？
    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候 会执行get
        return value;
      },
      set: function set(newValue) {
        // 修改的时候 会执行set
        if (newValue === value) return;
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; // 只对对象进行劫持
    }

    // 如果一个对象被劫持了，就无需再次劫持（可以增添一个实例，用实例判断是否被劫持过）
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; // data可能是函数或对象

    // 不使用call的话data并没有作为对象的方法被调用
    data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象

    //TODO: 为什么要有这一句才能在vm上观测到劫持
    // 将返回的对象放到了_data
    vm._data = data;

    // 对数据进行劫持 defineProperty
    observe(data);

    // 将vm._data 用vm代理，方便用户取值
    for (var key in data) {
      proxy(vm, '_data', key);
    }
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
  // 写第一行一样的
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
