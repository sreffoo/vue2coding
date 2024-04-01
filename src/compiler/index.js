const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配到分组为一个标签名 <xxx匹配到的是开始标签的名字
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配的是</xxx> 最终匹配到的分组就是结束标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
// 匹配属性
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 第一个分组就是属性的key value是 分组3/4/5
const startTagClose = /^\s*(\/?)>/ // <div> <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{asdasdas}} 匹配到内容就是表达式变量

// Vue3不采用正则
// 对模板进行编译处理
function parseHTML(html) { // html最开始肯定是一个标签
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = []
    let currentParent// 指向栈中最后一个
    let root
    // 最终需要转化为一颗抽象语法树
    function createASTElement(tag, attrs) {
        return  {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    // 类似leetcode括号匹配,用栈确定父子元素关系,进而构造一棵树
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs) // 创造一个ast节点
        if(!root){
            root = node
        }
        if(currentParent) {// 如果当前有父元素 设置当前元素父元素 以及父元素的子元素
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node
    }
    function chars(text) { // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g,'') // 如果空格超过2可以去删除2个以上的,不然渲染就没空格了
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        let node = stack.pop() // 弹出最后一个,可以校验标签是否合法
        currentParent = stack[stack.length - 1]
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if(start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: []
            }
            advance(start[0].length) // 匹配一段少一段
            
            // 如果不是开始标签的结束就一直匹配下去
            let attr, end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                // disabled这样的可能是个true
                match.attrs.push({name: attr[1], value: attr[3]||attr[4]||attr[5]||true})
            }
            if (end) {
                advance(end[0].length)
            }
            // console.log(match);
            return match
        }
        // console.log(html);
        return false // 不是开始标签
    }
    while (html) {
        // 流程
        // debugger

        // 如果textEnd为0 说明是一个开始标签或结束标签
        // 如果>0说明就是文本的结束为治 <div>hello</div>
        let textEnd = html.indexOf('<')
        if(textEnd == 0) {
            const startTagMatch = parseStartTag() // 开始标签的匹配结果
            if(startTagMatch){ // 解析到的开始标签
                // console.log(html);
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }

            let endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if(textEnd > 0) {
            let text = html.substring(0, textEnd)// 文本内容
            if(text) {
                chars(text)
                advance(text.length)// 解析到的文本
            }
        }
    }
    console.log(root);
}

export function compileToFunction(template) {
    // 1.将template转化为ast语法树
    console.log(template);
    let ast = parseHTML(template)
    // 2.生成render方法 方法执行后返回的结果就是虚拟DOM
    // console.log(template);
}