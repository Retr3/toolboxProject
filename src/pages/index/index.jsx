import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Swiper, SwiperItem } from '@tarojs/components'
import { AtIcon, AtGrid, AtToast } from 'taro-ui'

import './index.scss'


class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }
  state = {
    toastOpen:false,
    errorToast:false,
  }
  componentWillMount () { }

  componentWillReact () {
    console.log('componentWillReact')
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  toToolPage=(item)=>{
    const toolType = item.iconInfo.value || "";
    const that = this;
    console.log(toolType);
    switch(toolType){
      case 'chart':
          Taro.navigateTo({
            url: '../subPages/shoppingHistory-page/shoppingHistory-page',
            success: function(res) {
                console.log(res);
            },
            fail:function(err){
              console.log(err);
              that.setState({
                errorToast:true
              })
            }
          })
          return 
      case 'movice':
          Taro.navigateTo({
            url: '../subPages/movice-page/movice-page',
            success: function(res) {
                console.log(res);
            },
            fail:function(err){
              console.log(err);
              that.setState({
                errorToast:true
              })
            }
          })
          return
      case 'search':
          this.setState({
            toastOpen:true
          })
          // Taro.navigateTo({
          //   url: '../../subPages/my-collection/my-collection',
          //   success: function(res) {
          //       console.log(res);
          //   }
          // })
          return
      case 'weather':
          Taro.navigateTo({
            url: '../subPages/weather-page/weather-page',
            success: function(res) {
                console.log(res);
            },
            fail:function(err){
              console.log(err);
              that.setState({
                errorToast:true
              })
            }
          })
          return
      default : 
      this.setState({
        toastOpen:true
      })

    }
     
  }
  render () {
    return (
      <View className="container">
        {/* <View className="index-header">
          <View className="index-header__title">
          <AtIcon prefixClass='icon' value='Hold-all2' size='20' color='#0e78af'></AtIcon>
          <Text className="title_text">我的工具箱</Text>
          </View>
        </View> */}
        <View>
          <Swiper
          className='test-h'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          vertical={false}
          interval={2000}
          circular={true}
          indicatorDots={true}
          autoplay={true}>
            <SwiperItem >
              <View className='demo-text'>1</View>
            </SwiperItem>
            <SwiperItem >
              <View className='demo-text'>2</View>
            </SwiperItem>
            <SwiperItem  >
              <View className='demo-text'>3</View>
            </SwiperItem>
          </Swiper>
        </View>
        <View className="index-body">
          <AtGrid
         
          data={
            [
              {
                iconInfo:{
                  prefixClass:'icon',
                  size: 30,
                  value:'chart',
                  color:'#EE7000'
                },
                value: '网购历史\n价格查询'
              },
              {
                iconInfo:{
                  prefixClass:'icon',
                  size: 30,
                  value:'movice',
                  color:'#e5342a'
                },
                value: '查找电影'
              },
              {
                iconInfo:{
                  prefixClass:'icon',
                  size: 30,
                  value:'search',
                  color:'#0e78af'
                },
                value: '诗词查询'
              },
              {
                iconInfo:{
                  prefixClass:'icon',
                  size: 30,
                  value:'weather',
                  color:'#69b8f0'
                },
                value: '每日天气'
              },
              {
                iconInfo:{
                  prefixClass:'icon',
                  size: 30,
                  value:'more',
                  color:'#333333'
                },
                value: '更多功能\n敬请期待'
              }
            ]
          } 
          onClick={this.toToolPage}
          />
        </View>
        <AtToast isOpened={this.state.toastOpen} 
                duration={2000}
                text="敬请期待" 
                icon="heart" >
        </AtToast>
        <AtToast isOpened={this.state.errorToast} 
                duration={2000}
                text={`啊哦,出错了\n  o(>_<)o`}
                icon="close-circle" >
        </AtToast>
      </View>
    )
  }
}

export default Index 
