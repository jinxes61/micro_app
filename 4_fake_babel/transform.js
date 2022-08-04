// 将树状属性结构转换输出可执行代码
function transform(elem) {
    // 处理属性键值对
    function processAttrs(attrs) {
      let result = [];
  
      let keys = Object.keys(attrs);
  
      keys.forEach((key, index) => {
        let type = attrs[key].type;
        let value = attrs[key].value;
  
        // 需要区分字符串和变量引用
        let keyValue = `${key}: ${type === 'ref' ? value : '"' + value + '"'}`;
  
        if (index < keys.length - 1) {
          keyValue += ',';
        }
  
        result.push(keyValue);
      });
  
      if (result.length < 1) {
        return 'null';
      }
  
      return '{' + result.join('') + '}';
    }
  
    // 处理结点元素
    function processElem(elem, parent) {
      let content = '';
  
      // 处理子结点
      elem.children.forEach((child, index) => {
        // 子结点是标签元素
        if (child.tag) {
          content += processElem(child, elem);
          return;
        }
  
        // 以下处理文本结点
  
        if (child.type === 'expr') {
          // 表达式
          content += child.value;
        } else {
          // 字符串字面量
          content += `"${child.value}"`;
        }
  
        if (index < elem.children.length - 1) {
          content += ',';
        }
      });
  
      let isLastChildren = elem === parent.children[parent.children.length -1];
  
      return (
        `React.createElement(
            '${elem.tag}',
            ${processAttrs(elem.attrs)}${content.trim().length ? ',' : ''}
            ${content}
        )${isLastChildren ? '' : ','}`
      );
    }
  
    return processElem(elem, elem).replace(/,$/, '');
  }

  module.exports = transform;