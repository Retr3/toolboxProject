import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtButton,AtList, AtListItem} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import './weather-page.scss'
@inject('weatherStore')
@observer
class Weather extends Component{
    config = {
        navigationBarTitleText: '每日天气'
      }
    render(){
        const {weatherStore} = this.props;
        console.log(weatherStore);
        /**用渐变背景色 百度天气的配色*/
        /**请求v6接口获取3天天气 布局仿qq天气*/
        return (<View class="container">
                    {weatherStore.weatherInfo.air+""+weatherStore.weatherInfo.city}
                </View>)
    }
}
export default Weather