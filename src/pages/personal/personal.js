import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtButton,AtList, AtListItem} from 'taro-ui'
import unloginPng from '../../images/unlogin.png'
import './personal.scss'
class Personal extends Component{
    config = {
        navigationBarTitleText: '个人中心'
      }
      state={
        userInfo:Taro.getStorageInfoSync('userInfo') || {}
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
          title: '',
          path: '/pages/me/me',
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
            url: '../subPages/my-collection/my-collection',
            success: function(res) {
                console.log(res);
            }
          })
      }
      toAboutPage =()=>{
        Taro.navigateTo({
            url: '../subPages/about-page/about-page',
            success: function(res) {
                console.log(res);
            }
          })
      }
    render(){
        return (<View className="container">
            <View className="header">
            {
                    this.state.userInfo.openid ?<View>
                        <Image className="avatar" src={this.state.userInfo.avatarUrl} /> 
                        <View>{this.state.userInfo.nickName}</View>   
                     </View>
                : <View>
                        <Image className="avatar" src={unloginPng} />
                        
                            <AtButton 
                            type='primary'
                            size="small" 
                            onGetUserInfo={this.onGetUserInfo}
                            openType="getUserInfo">登录</AtButton>
                </View>
            }
             </View>
           
             <AtList className="info">
                 
                    <AtListItem  
                        title='我的收藏' 
                        arrow='right' 
                        onClick={this.toMyCollection}
                        iconInfo={{ size:25, prefixClass:'icon', value: 'star', }}/>
                    <Button className='btn' openType='share'>
                        <AtListItem  
                            title='分享给朋友' 
                            arrow='right' 
                            iconInfo={{ size:25, prefixClass:'icon', value: 'share', }}/>
                    </Button>
                    <Button className='btn' openType='contact'>
                        <AtListItem  
                            title='联系客服' 
                            arrow='right' 
                            iconInfo={{ size:25, prefixClass:'icon', value: 'service', }}/>
                    </Button>
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