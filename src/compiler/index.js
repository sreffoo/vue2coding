import { parseHTML } from "./parse";

function genProps(attrs) {
    let str = '' // {name, value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if(attr.name === 'style') {
            // color:red; background:red => {color: 'red'}
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            });
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`// a:b,c:d,
    }
    return `{${str.slice(0, -1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{asdasdas}} 匹配到内容就是表达式变量
function gen(node) {
    if(node.type === 1) {
        return codegen(node)
    }else {
        // 文本
        let text = node.text
        if(!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        }else {
            // _v( _s(name)+'hello'+ _s(age))
            let tokens = []
            let match
            // 因为正则表达式有/g
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                // console.log(match);
                let index = match.index
                if(index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = `_c('${ast.tag}',${
        ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
    }${
        ast.children.length ? `,${children}` : ''
    })`
    return code
}

export function compileToFunction(template) {
    // 1.将template转化为ast语法树
    // console.log(template);
    let ast = parseHTML(template)
    // 2.生成render方法 方法执行后返回的结果就是虚拟DOM
    // console.log(ast);
    // 所有模板引擎的实现原理就是 with + new Function
    let code = codegen(ast)
    // console.log(code);

    code = `with(this) {
                return ${code}
            }`
    let render = new Function(code) // 根据代码生成render函数
    // console.log(render);
    return render
}