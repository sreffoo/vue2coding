(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    // 匹配到分组为一个标签名 <xxx匹配到的是开始标签的名字
    var startTagOpen = new RegExp("^<".concat(qnameCapture));
    // 匹配的是</xxx> 最终匹配到的分组就是结束标签的名字
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
    // 匹配属性
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    // 第一个分组就是属性的key value是 分组3/4/5
    var startTagClose = /^\s*(\/?)>/; // <div> <br/>

    // Vue3不采用正则
    // 对模板进行编译处理
    function parseHTML(html) {
      // html最开始肯定是一个标签
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = [];
      var currentParent; // 指向栈中最后一个
      var root;
      // 最终需要转化为一颗抽象语法树
      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }
      // 类似leetcode括号匹配,用栈确定父子元素关系,进而构造一棵树
      function start(tag, attrs) {
        var node = createASTElement(tag, attrs); // 创造一个ast节点
        if (!root) {
          root = node;
        }
        if (currentParent) {
          // 如果当前有父元素 设置当前元素父元素 以及父元素的子元素
          node.parent = currentParent;
          currentParent.children.push(node);
        }
        stack.push(node);
        currentParent = node;
      }
      function chars(text) {
        // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, ''); // 如果空格超过2可以去删除2个以上的,不然渲染就没空格了
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
      function end(tag) {
        stack.pop(); // 弹出最后一个,可以校验标签是否合法
        currentParent = stack[stack.length - 1];
      }
      function advance(n) {
        html = html.substring(n);
      }
      function parseStartTag() {
        var start = html.match(startTagOpen);
        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: []
          };
          advance(start[0].length); // 匹配一段少一段

          // 如果不是开始标签的结束就一直匹配下去
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            // disabled这样的可能是个true
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }
          if (_end) {
            advance(_end[0].length);
          }
          // console.log(match);
          return match;
        }
        // console.log(html);
        return false; // 不是开始标签
      }
      while (html) {
        // 流程
        // debugger

        // 如果textEnd为0 说明是一个开始标签或结束标签
        // 如果>0说明就是文本的结束为治 <div>hello</div>
        var textEnd = html.indexOf('<');
        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配结果
          if (startTagMatch) {
            // 解析到的开始标签
            // console.log(html);
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }
        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容
          if (text) {
            chars(text);
            advance(text.length); // 解析到的文本
          }
        }
      }
      console.log(root);
    }
    function compileToFunction(template) {
      // 1.将template转化为ast语法树
      console.log(template);
      parseHTML(template);
      // 2.生成render方法 方法执行后返回的结果就是虚拟DOM
      // console.log(template);
    }

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

    // 重写数组的部分方法（变异方法）

    // 获取数组原型
    var oldArrayProto = Array.prototype;

    // 使得newArrayProto.__proto__ 指向 oldArrayProto  所以修改了他的方法还可以从原型拿到原来的方法
    var newArrayProto = Object.create(oldArrayProto);
    var methods = [
    // 找到所有变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice 都不会改变原数组

    methods.forEach(function (method) {
      // 例如 arr.push(1,2,3)
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // 这里重写数组的方法
        // 内部调用的原方法 函数劫持 切片编程

        //TODO:...
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 这里this要改成arr的this push.call(arr)
        console.log(method);

        // 如果新增的数据是对象，还需要继续劫持
        var inserted;
        // this指向arr 也就是data
        var ob = this.__ob__;
        switch (method) {
          case 'push':
          case 'unshift':
            // arr.unshift(1,2,3)
            inserted = args;
            break;
          case 'splice':
            // arr.splice(0,1,{a:1},{a:1})
            inserted = args.slice(2);
        }
        if (inserted) {
          // 对新增内容进行观测
          // 此时的this仍指向arr，Observer类里的data
          ob.observeArray(inserted);
        }
        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      // 用于观测，观测的方法都写在里面

      function Observer(data) {
        _classCallCheck(this, Observer);
        // Object.defineProperty只能劫持已经存在的属性（vue里会因此单独写一些api $set $delete）

        // 自定义一个属性放this 同时给数据加了标识，有则说明被观测过
        // 如果写data.__ob__ = this 若data是对象会造成死循环
        // 因此不能在循环时遍历这个属性
        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 不可枚举 循环时不可获取
        });
        if (Array.isArray(data)) {
          // 在保留数组原方法的情况下重写数组中的方法 7个变异方法    
          data.__proto__ = newArrayProto;
          this.observeArray(data);
        } else {
          this.walk(data);
        }
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
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 对数组中的对象劫持 不劫持所有元素
          data.forEach(function (item) {
            return observe(item);
          });
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
          // set的值可能又是一个对象 再次代理
          observe(newValue);
          value = newValue;
        }
      });
    }
    function observe(data) {
      // 对这个对象进行劫持
      if (_typeof(data) !== 'object' || data == null) {
        return; // 只对对象进行劫持
      }
      if (data.__ob__ instanceof Observer) {
        // 如果这个属性是Observer的实例 说明被代理过了
        // 直接返回他的实例
        return data.__ob__;
      }
      // 如果一个对象被劫持了，就无需再次劫持（可以增添一个实例，用实例判断是否被劫持，如上）
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
        if (options.el) {
          vm.$mount(options.el); // 数据挂载
        }
      };
      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;
        if (!ops.render) {
          // 先进行查找有没有render函数
          var template; // 没有render看是否写template，没写就用外部的template
          if (!ops.template && el) {
            // 没写模板，但写了el
            template = el.outerHTML;
          } else {
            if (el) {
              // 如果有el 采用模板内容
              template = ops.template;
            }
          }
          if (template) {
            // 这里需要对模板进行编译
            var render = compileToFunction(template);
            ops.render = render;
          }
        }
        ops.render; // 最终就可以获取render方法

        // script标签引用的vue.global.js的话，这个编译过程在浏览器运行
        // runtime不包含模板编译（options中的那个），因此用runtime的时候不能用template
        // 整个编译是打包时通过loader转移.vue文件的
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
