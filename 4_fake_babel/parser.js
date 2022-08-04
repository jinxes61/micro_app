const parseJSX = function () {
    const TAG_LEFT = '<';
    const TAG_RIGHT = '>';
    const CLOSE_SLASH = '/';
    const WHITE_SPACE = ' ';
    const ATTR_EQUAL = '=';
    const DOUBLE_QUOTE = '"';
    const LEFT_CURLY = '{';
    const RIGHT_CURLY = '}';
  
    let at = -1;        // 当前解析的位置
    let stack = [];     // 放置已解析父结点的栈
    let source = '';    // 要解析的JSX代码内容
    let parent = null;  // 当前元素的父结点
  
    // 寻找目标字符
    let seek = (target) => {
      let found = false;
  
      while (!found) {
        let ch = source.charAt(++at);
  
        if (ch === target) {
          found = true;
        }
      }
    };
  
    // 向前搜索目标信息
    let explore = (target) => {
      let index = at;
      let found = false;
      let rangeStr = '';
  
      while (!found) {
        let ch = source.charAt(++index);
  
        if (target !== TAG_RIGHT && ch === TAG_RIGHT) {
          return {
            at: -1,
            str: rangeStr,
          };
        }
  
        if (ch === target) {
          found = true;
        } else if (ch !== CLOSE_SLASH) {
          rangeStr += ch;
        }
      }
  
      return {
        at: index - 1,
        str: rangeStr,
      };
    };
  
    // 跳过空格
    let skipSpace = () => {
      while (true) {
        let ch = source.charAt(at + 1);
  
        if (ch === TAG_RIGHT) {
          at--;
          break;
        }
  
        if (ch !== WHITE_SPACE) {
          break;
        } else {
          at++;
        }
      }
    };
  
    // 解析标签体
    let parseTag = () => {
      if (stack.length > 0) {
        let rangeResult = explore(TAG_LEFT);
  
        let resultStr = rangeResult.str.replace(/^\n|\n$/, '').trim();
        
        if (resultStr.length > 0) {
          let exprPositions = [];
  
          resultStr.replace(/{.+?}/, function(match, startIndex) {
            let endIndex = startIndex + match.length - 1;
            exprPositions.push({
              startIndex,
              endIndex,
            });
          });
  
          let strAry = [];
          let currIndex = 0;
  
          while (currIndex < resultStr.length) {
            // 没有表达式了
            if (exprPositions.length < 1) {
              strAry.push({
                type: 'str',
                value: resultStr.substring(currIndex),
              });
              break;
            }
  
            let expr = exprPositions.shift();
  
            strAry.push({
              type: 'str',
              value: resultStr.substring(currIndex, expr.startIndex),
            });
  
            strAry.push({
              type: 'expr',
              value: resultStr.substring(expr.startIndex + 1, expr.endIndex),
            });
  
            currIndex = expr.endIndex + 1;
          }
  
          parent.children.push(...strAry);
  
          at = rangeResult.at;
          
          parseTag();
  
          return parent;
        }
      }
  
      seek(TAG_LEFT);
  
      // 闭合标记 例如: </div>
      if (source.charAt(at + 1) === CLOSE_SLASH) {
        at++;
  
        let endResult = explore(TAG_RIGHT);
  
        if (endResult.at > -1) {
          // 栈结构中只有一个结点 当前是最后一个闭合标签
          if (stack.length === 1) {
            return stack.pop();
          }
  
          let completeTag = stack.pop();
  
          // 更新当前父结点
          parent = stack[stack.length - 1];
  
          parent.children.push(completeTag);
  
          at = endResult.at;
  
          parseTag();
  
          return completeTag;
        }
      }
  
      let tagResult = explore(WHITE_SPACE);
  
      let elem = {
        tag: tagResult.str,
        attrs: {},
        children: [],
      };
  
      if (tagResult.at > -1) {
        at = tagResult.at;
      }
  
      // 解析标签属性键值对
      while (true) {
        skipSpace();
  
        let attrKeyResult = explore(ATTR_EQUAL);
  
        if (attrKeyResult.at === -1) {
          break;
        }
  
        at = attrKeyResult.at + 1;
  
        let attrValResult = {};
  
        if (source.charAt(at + 1) === LEFT_CURLY) {
          // 属性值是引用类型
  
          seek(LEFT_CURLY);
  
          attrValResult = explore(RIGHT_CURLY);
          
          attrValResult = {
            at: attrValResult.at,
            info: {
              type: 'ref',
              value: attrValResult.str,
            }
          };
        } else {
          // 属性值是字符串类型
  
          seek(DOUBLE_QUOTE);
  
          attrValResult = explore(DOUBLE_QUOTE);
  
          attrValResult = {
            at: attrValResult.at,
            info: {
              type: 'str',
              value: attrValResult.str,
            }
          };
        }
  
        at = attrValResult.at + 1;
  
        skipSpace();
  
        elem.attrs[attrKeyResult.str] = attrValResult.info;
      }
  
      seek(TAG_RIGHT);
  
      // 检测是否为自闭合标签
      if (source.charAt(at - 1) === CLOSE_SLASH) {
        // 自闭合标签 追加到父标签children中 然后继续解析
        if (stack.length > 0) {
          parent.children.push(elem);
  
          parseTag();
        }
      } else {
        // 有结束标签的 入栈 然后继续解析
        stack.push(elem);
  
        parent = elem;
  
        parseTag();
      }
  
      return elem;
    };
  
    return function (jsx) {
      source = jsx;
      return parseTag();
    };
  }();

  module.exports = parseJSX;