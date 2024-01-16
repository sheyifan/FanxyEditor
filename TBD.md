# TBD

## Breaks

Page break https://en.wikipedia.org/wiki/Page_break#:~:text=Form%20feed%20is%20a%20page,Ctrl%20%2B%20L%20or%20%5EL.

## Debugger

元素检查器，鼠标不断移动，显示当前的元素属性  

## 接口设计

数据模型是什么？ —— 一个Text数组，Text代表单个码点，这个码点的样式信息都存储在Text的属性中  
用户接口数据类型是什么？ —— 用户以段落为整体进行编辑，因为编辑位置的文字样式与整个段落的格式、段落里周边文字的格式有关系。所以说接口是坐标 -> 段落  