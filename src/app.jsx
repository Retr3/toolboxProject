import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'

import wallpaperStore from './store/wallpaperStore'
import weatherStore from './store/weatherStore'
import './app.scss'
import './assets/font/iconfont.css'
// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
wx.cloud.init({
  env:'zxytest-37pbw',
  traceUser: true
})
const store = {
  wallpaperStore,
  weatherStore
}

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/personal/personal',
      'pages/subPages/about-page/about-page',
      'pages/subPages/shoppingHistory-page/shoppingHistory-page',
      'pages/subPages/movice-page/movice-page',
      'pages/subPages/weather-page/weather-page',
      'pages/subPages/wallpaper-page/wallpaper-page'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    "tabBar": {
      "selectedColor": "#1296db",
      "list": [{
          "pagePath": "pages/index/index",
          "text": "首页",
          "iconPath": "images/home.png",
          "selectedIconPath": "images/home-active.png"
      }, {
          "pagePath": "pages/personal/personal",
          "text": "我的",
          "iconPath": "images/user.png",
          "selectedIconPath": "images/user-active.png"
      }]
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序定位功能"
      }
    }
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
