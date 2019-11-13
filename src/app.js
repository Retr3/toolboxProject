import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import '@tarojs/async-await'
import Index from './pages/index/index'

import navStore from './store/navStore'
import wallpaperStore from './store/wallpaperStore'
import weatherStore from './store/weatherStore'
import todayHistoryStore from './store/todayHistoryStore'
import movieStore from './store/movieStore'
import poemStore from './store/poemStore'

import './app.scss'
import './assets/font/iconfont.css'
// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
//小程序云环境配置
wx.cloud.init({
  //env:'zxytest-37pbw'
  env:'z-prod-env-5kd1i',
  traceUser: true
})
const store = {
  wallpaperStore,
  weatherStore,
  todayHistoryStore,
  movieStore,
  poemStore,
  navStore
}

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/personal/personal'
    ],
    "subPackages": [
      {
        "root": "pages/subPages/wallpaper-page/",
        "pages": [
          'wallpaper-page'
        ]
      },
      {
        "root": "pages/subPages/weather-page/",
        "pages": [
          'weather-page',
        ]
      },
      {
        "root": "pages/subPages/todayHistory-page/",
        "pages": [
          'todayHistory-page',
        ]
      },
      {
        "root": "pages/subPages/movie-page/",
        "pages": [
          'movie-page',
          'movie-detail',
          'movie-collection'
        ]
      },
      {
        "root": "pages/subPages/shoppingHistory-page",
        "pages": [
          'shoppingHistory-page'
        ]
      },
      {
        "root": "pages/subPages/calendar-page",
        "pages": [
          'calendar-page'
        ]
      },
      {
        "root": "pages/subPages/exchangeRate-page",
        "pages": [
          'exchangeRate-page'
        ]
      },
      {
        "root": "pages/subPages/poem-page",
        "pages": [
          'poem-page',
          'poem-detail'
        ]
      },
      {
        "root": "pages/subPages/help-page",
        "pages": [
          'help-page'
        ]
      },
      {
        "root": "pages/subPages/about-page",
        "pages": [
          'about-page'
        ]
      }
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
          "iconPath": "assets/images/home.png",
          "selectedIconPath": "assets/images/home-active.png"
      }, {
          "pagePath": "pages/personal/personal",
          "text": "我的",
          "iconPath": "assets/images/user.png",
          "selectedIconPath": "assets/images/user-active.png"
      }]
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序定位功能"
      }
    }
  }
  componentDidMount () {
  }

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
