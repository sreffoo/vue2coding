const strats = {};
const LIFECYCLE = ['beforeCreate', 'created'];
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c);
            } else {
                return [c];
            }
        } else {
            return p;
        }
    };
});

strats.components = function(parentVal,childVal) {
    const res = Object.create(parentVal)
    if (childVal) {
        for(let key in childVal) {
            // 优先拿从儿子拷贝的 找不到就再拿父亲原型上的
            res[key] = childVal[key]
        }
    }
    // 返回的是构造的对象
    return res
}

export function mergeOptions(parent, child) {
    const options = {};

    for (let key in parent) {
        // 循环老的
        mergeField(key);
    }
    for (let key in child) {
        // 循环新的
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }

    function mergeField(key) {
        // 策略模式减少if else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            // 例如父是空对象
            options[key] = child[key] || parent[key]; // 默认策略 优先采用儿子，在采用父亲
        }
    }
    return options;
}