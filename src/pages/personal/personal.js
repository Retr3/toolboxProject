import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtButton,AtList, AtListItem} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import {otherImgUrl} from '../../untils/untils'
import unloginPng from '../../images/unlogin.png'
import './personal.scss'
@inject('navStore')
@observer
class Personal extends Component{
    config = {
        navigationBarTitleText: '个人中心',
        "navigationStyle": "custom"
      }
      state={
        userInfo:Taro.getStorageSync('userInfo') || {}
      }
      onGetUserInfo=(e)=>{
        let userInfo = e.detail.userInfo;
        wx.cloud.callFunction({
            name:'login',
            complete:res=>{
              console.log(res.result);
                userInfo.openid = res.result.openid
                this.setState({
                    userInfo
                },()=>{
                    Taro.setStorageSync("userInfo",userInfo)
                })

            }

        })
      }
      onShareAppMessage=()=>{
        var that = this;
        return {
          title: '这有一个野生的小程序',
          imageUrl:otherImgUrl+'about-bg2.jpg',
          path: '/pages/index/index',
          success: function (res) {
            // 转发成功
     
            that.shareClick();
          },
          fail: function (res) {
            // 转发失败
          }
        }
      }
      toMyCollection =()=>{
        Taro.navigateTo({
            url: '../subPages/help-page/help-page',
            success: function(res) {}
          })
      }
      toAboutPage =()=>{
        Taro.navigateTo({
            url: '../subPages/about-page/about-page',
            success: function(res) {}
          })
      }
    render(){
      const { navStore } = this.props;
        return (<View className="container">
            <View className="header">
                <View className="bar-transparent" style={`height:${navStore.navHeight}px;width:100%`}> </View>
            {
                    this.state.userInfo.openid ?<View>
                        <Image className="avatar" src={this.state.userInfo.avatarUrl} /> 
                        <View className="nickName">{this.state.userInfo.nickName}</View>   
                     </View>
                : <View>
                        <Image className="avatar" src={unloginPng} />
                        
                            <Button 
                            className="btn-style"
                            size="small" 
                            onGetUserInfo={this.onGetUserInfo}
                            openType="getUserInfo">登录</Button>
                </View>
            }
             </View>
           
             <AtList className="info">
                 
                    <Button className='btn' openType='share'>
                        <AtListItem  
                            title='分享给朋友' 
                            arrow='right' 
                            iconInfo={{ size:25, prefixClass:'icon', value: 'share', }}/>
                    </Button>
                    <Button className='btn' openType='contact'>
                        <AtListItem  
                            title='客服反馈' 
                            arrow='right' 
                            iconInfo={{ size:25, prefixClass:'icon', value: 'service', }}/>
                    </Button>
                    <AtListItem  
                        title='帮助' 
                        arrow='right' 
                        onClick={this.toMyCollection}
                        iconInfo={{ size:25, prefixClass:'icon', value: 'help'}}/>
                    <AtListItem  
                        title='关于' 
                        arrow='right' 
                        onClick={this.toAboutPage}
                        iconInfo={{ size:25, prefixClass:'icon', value: 'info', }}/>
                    
             </AtList>
        </View>)
    }
}
export default Personal