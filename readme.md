# 基于Taro的工具箱小程序  

数据全部来自于网络,一部分数据APi是网上抓取,一部分使用的是网上免费的API接口  
项目使用到了echarts tooptip的功能，目前eahcrts正式版暂不支持，使用可以参考[echarts在小程序中支持图表tooptip功能](https://github.com/Retr3/toolboxProject/blob/dev/about.md)
<br/>
`扫描体验`：  
<img src=''></img>
<br/>

### 实现的功能  
v 1.0
- [x] 实时天气查询(用户拒绝定位默认显示北京)
- [x] 历史上的今天
- [x] 每日壁纸
- [x] 网购历史查询
- [x] 电影简介、评分查询(需要登录)
- [x] 收藏电影
- [x] 老黄历
- [x] 汇率
- [x] 藏头诗
v 1.1
- [ ] 快递查询
- [ ] 生成自定义图片功能  
	...
<br/>

### 项目目录结构  
```
├── assets    
│   ├── font                        # 项目icon文件       
│   └── images                      # 项目图片文件                   
├── components
│   └── NavBar                      # 导航栏组件
├── pages
│   ├── index                       # tab页-主页
│   ├── personal                    # tab页-用户中心页     
│   ├── subPages                    # 非tab页面   
│   │   ├── about-page              # “关于”页面
│   │   ├── calendar-page           # “老黄历”页面
│   │   ├── exchangeRate-page       # “汇率”页面
│   │   ├── help-page               # “帮助”页面
│   │   ├── movie-page              # “电影评分”功能
│   │   │   ├──movie-collection     # “我的收藏”页面
│   │   │   ├──movie-detail         # “电影详情”页面
│   │   │   └──movie-page           # “电影评分首页”页面
│   │   ├── poem-page               # “藏头诗”功能
│   │   │   ├──poem-detail          # “藏头诗结果”页面
│   │   │   └──poem-page            # “藏头诗首页”页面
│   │   ├── shoppingHistory-page    # “商品历史价”页面
│   │   ├── todayHistory-page       # “历史上的今天”页面
│   │   ├── wallpaper-page          # “每日壁纸”页面
│   │   └── weather-page            # “天气”页面
├── store
│   ├── movieStore.js               # 电影功能Store
│   ├── navStore.js                 # 导航栏Store 
│   ├── poemStore.js                # 藏头诗Store 
│   ├── todayHistoryStore.js        # 历史上的今天Store 
│   ├── wallpaperStore.js           # 每日壁纸Store
│   └── weatherStore.js             # 天气Store
├── untils
│   ├── movie-until.js              # 电影功能工具函数 
│   ├── nav-height.js               # 导航栏工具函数
│   ├── tool.js                     # 通用工具函数
│   ├── untils.js                   # 请求地址
│   └── weather-api.js              # 天气功能工具函数
├── app.js                          # 小程序逻辑
├── app.scss                        # 小程序公共样式表
└── index.html                      # 入口页面(H5)
```

### 存在问题

- 因为微信云函数有流量限制，所以获取实时天气的方法放在了前台进行运算，每日天气应该每次查询都从接口实时调用，现在是先获取天气存入库中，然后根据数据库上一次获取的时间每三小时获取一次最新的天气，逻辑判断比较多，前端资源消耗较大，运行速度会慢些
- 主包体积过大，可以优化  
- 接口稳定性(汇率功能不稳定，中行网站高峰期会崩溃)
<br/>


### 运行本项目
1. 项目需要全局安装@tarojs/cli（npm install -g @tarojs/cli）  
2. npm install
3. 运行 npm run dev:weapp / npm run build:weapp  
4. 微信开发者工具打开后关闭安全域名的校验（设置 --> 项目设置 --> 不校验合法域名）
<br/>
`注:untils.js中的接口配置及文件路径需要根据自身情况自行配置`
<hr/>

小程序开发周期不长，代码还在优化，有问题可以随时联系我进行反馈或[issue](https://github.com/Retr3/toolboxProject/issues)，如果代码对您有帮助就给个star鼓励下吧
