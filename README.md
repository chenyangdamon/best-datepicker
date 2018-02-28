# best-datepicker 是什么?
应用于web开发的日历组件.
# 演示
[Demo](https://chenyangdamon.github.io/best-datepicker/dist/)
# 依赖 
- jquery
# 安装
## script
```html
// import jquery.js
<script type="text/javascript" src="js/jquery.js"></script>
// import best-datepicker.js
<script type="text/javascript" src="js/best-datepicker.js"></script>
```
# 示例
index.js
```html
<script type="text/javascript">
$(function(){
  
  // 实例化Datepicker
  var datepicker=new datepicker(options);
  
  // open
  datepicker.open();
  
  // close
  datepicker.close();
  
});
</script>
```
# 结构
## 配置项
|属性|说明|默认值|字段类型|
|:---|---|---|---|
| `container`|Container for carrying components.|`$("body")`|`String`|
| `format`|格式化 2020-10-21 13:30:12|`"yyyy-mm-dd hh:mm:ss"`|`String`|
| `width`|组件宽度|'240'|`String`|
| `showBar`|是否显示底部bar|`true`|`Boolean`|
| `range`|区间范围选择|`true`|`String`|

## 方法
#### open(conf)
打开日历组件
- conf.container
- conf.uclass
- conf.mode 
- conf.effect
- conf.url
- conf.show
- conf.text

#### close()
关闭日历组件
