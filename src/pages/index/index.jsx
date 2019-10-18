import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Swiper, SwiperItem } from '@tarojs/components'
import { AtIcon, AtGrid, AtToast,AtButton } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import './index.scss'
import cityCode from '../../untils/cityCode'
import weatherApi from '../../untils/weather-api'

import '../../assets/images/weather/bingbao.jpg'
import '../../assets/images/weather/lei.jpg'
import '../../assets/images/weather/qing.jpg'
import '../../assets/images/weather/shachen.jpg'
import '../../assets/images/weather/wu.jpg'
import '../../assets/images/weather/xue.jpg'
import '../../assets/images/weather/yin.jpg'
import'../../assets/images/weather/yu.jpg'
import '../../assets/images/weather/yun.jpg'

// import QQMapWX from '../../untils/qqmap-wx-jssdk'
const QQMapWX = require('../../untils/qqmap-wx-jssdk.js');

const db = wx.cloud.database();
const qqmapsdk = new QQMapWX({
  key: '2TJBZ-32M3F-A64J4-ND4CX-5G2K6-WTBN7'
});
@inject('wallpaperStore')
@inject('weatherStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }
  state = {
    toastOpen:false,
    errorToast:false,
    wallpaperUrl:'',
    wallpaperMsg:'',
    newImgName:''
    
  }
  
  componentWillMount () {
    let windowsWidth = Taro.getSystemInfoSync().windowWidth;
    let windowsHeight = Taro.getSystemInfoSync().windowHeight;
    let resolution = '480';
    if(windowsWidth>700 && windowsHeight>900){
        resolution = '768x0';
    }
    this.judgeWallpaper(resolution);
  }

  componentWillReact () {
    console.log('componentWillReact')
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  componentDidMount () { 
    const { weatherStore } = this.props;
    let that = this;
    Taro.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: newRes => {
            let cityInfo = newRes.result.address_component;
            let cityMark =cityInfo.province.substring(0, 2)+cityInfo.city.substring(0,2)+cityInfo.district.substring(0, 2);
            let municipalName = cityInfo.city;
            let cityId;
            //如果定位失败，显示默认地址
            cityCode[cityMark]?cityId = cityCode[cityMark].id : cityId = cityCode['北京北京北京'].id
            //获取天气接口
            weatherApi(cityId).then(res=>{
              if(Array.isArray(res.data)){
                let result = res.data[0];
                console.log(result);
                weatherStore.getWeatherInfo({...result,municipalName});
              }else{
                let newUpdate = res.date+" "+res.update_time;
                weatherStore.getWeatherInfo({...res,newUpdate,municipalName});
                that.weatherDbOperation(res.isAdd,res,newUpdate)
              }
            }).catch(err=>{
              console.log(err);
            });

          },
          fail: err => { 
            console.log(err)
          }
        })
      },
      fail:err=>{
        console.log("定位失败"+err);
      }
     })
   
  }
  //网格跳转
  toToolPage=(item)=>{
    const toolType = item.iconInfo.value || "";
    const that = this;
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
      default : 
      this.setState({
        toastOpen:true
      })

    }
     
  }
  //天气跳转
  toWeather = ()=>{
    Taro.navigateTo({
      url: '../subPages/weather-page/weather-page',
      success: function(res) {
      },
      fail:function(err){
        console.log(err);
      }
    })
  }
  /**---------weather function start------------ */
  //天气数据库操作
  weatherDbOperation = (flag,data,newUpdate)=>{
    if(flag === "1"){
      db.collection('live_weather').add({
        data:{
          ...data,
          newUpdate
        },
        success:results=>{
          Taro.setStorageSync("cityid",data.cityid)
          Taro.setStorageSync("updatetime",newUpdate)
          console.log('add');
        },
        fail:err=>{
          console.log(err);
        }
      })
    }else{
      db.collection('live_weather').where({
          cityid:data.cityid
      }).get({
        success:res=>{
          db.collection('live_weather').doc(res.data[0]._id).update({
            data:{
              ...data,
              newUpdate
            },
            success:res=>{
              console.log("update");
              Taro.setStorageSync("cityid",data.cityid)
              Taro.setStorageSync("updatetime",newUpdate)
            },
            fail:err=>{
              console.log(err);
            }
          })
        },
        fail:err=>{
          console.log(err);
        }
      })
    }
  }
  /**---------weather function end------------ */

  //壁纸跳转
  toWallpaper = ()=>{
    Taro.navigateTo({
      url: '../subPages/wallpaper-page/wallpaper-page',
      success: function(res) {
      },
      fail:function(err){
        console.log(err);
      }
    })
  
  }
  /**------wallpaper function start----------- */
  //判断今日壁纸是否已经入库
  judgeWallpaper = resolution=>{
    const { wallpaperStore } = this.props;
    db.collection('wallpaper_archive').where({
      enddate: wallpaperStore.nowDate,
      resolution: resolution
    }).get({
      success: redata=>{
        if(redata && redata.data.length>0){
          console.log('存在壁纸，读库');
          this.pathchange(redata.data[0].fileId).then(res=>{
              console.log(res.fileList[0].tempFileURL);
              wallpaperStore.changeurl(res.fileList[0].tempFileURL);
              wallpaperStore.changemsg(redata.data[0].wallpaperMsg);
              
            }).catch(err=>{
              console.log("路径转换错误"+err)
            })
        }else{
          this.getWallpaperFn(resolution);
        }
      },
      fail:err=>{
        console.log("报错了"+err);
      }
    })
  }
  //读取云函数，拉取每日壁纸
  getWallpaperFn = resolution=>{
    wx.cloud.callFunction({
      name:'getBingWallpaper',
      data:{
          ids:0,
          resolution:resolution,
          num:2
      },
      success:res=>{
            console.log("suc");
            let wallpaperInfo = res.result;
            if(!wallpaperInfo.code){
                this.setState({
                    wallpaperUrl:wallpaperInfo[0].retImg,
                    wallpaperMsg:wallpaperInfo[0].copyright,
                    newImgName:wallpaperInfo[0].hsh+wallpaperInfo[0].enddate+'_'+resolution+'.jpg'
                },()=>{
                    this.getImageFn(resolution);
                })
                
            }else{
                console.log(wallpaperInfo.msg);
            }
            
        },
        fail: err => {
            // handle error
            console.log("读取云端函数失败"+err);
        },
        complete: () => {

        }

    })
  }
  //上传图片，信息入库
  getImageFn =resolution=>{
    const { wallpaperStore } = this.props;
    Taro.getImageInfo({
          src:this.state.wallpaperUrl,
          success: res=>{
              let {path} = res;
              let that = this;
              wx.cloud.uploadFile({
                  cloudPath:'wallpaper_img/'+this.state.newImgName,
                  filePath: path,
                  config:{
                      env:'zxytest-37pbw'
                  },
                  success:res=>{
                      console.log("上传成功:"+res.fileID);
                      db.collection('wallpaper_archive').add({
                        data:{
                          enddate:wallpaperStore.nowDate,
                          wallpaperUrl:this.state.wallpaperUrl,
                          wallpaperMsg:this.state.wallpaperMsg,
                          fileId:res.fileID,
                          resolution:resolution
                        },
                        success:add=>{
                          if(add._id){
                            console.log("addsuc"+add);
                            this.pathchange(res.fileID).then(result=>{
                              wallpaperStore.changeurl(result.fileList[0].tempFileURL);
                              wallpaperStore.changemsg(that.state.wallpaperMsg);
                            }).catch(err=>{
                              console.log("路径转换错误"+err)
                            })
                          }
                        }
                      });
                  },
                  fail:err=>{
                      console.log("上传失败:"+err);
                  }
              })
          },
          fail:err=>{
              console.log(err);
          }
      })
  }
  /**--------wallpaper function end --------------- */
  //获取文件临时路径 有效期:48hour
  pathchange = fileid=>{
    return wx.cloud.getTempFileURL({
      fileList:[fileid],
      maxAge: 60 * 60 * 48})
  }
  render () {
    const { wallpaperStore,weatherStore } = this.props;
    return (
      <View className="container">
        <View>
          <Swiper
          className='test-h'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          vertical={false}
          interval={3000}
          circular={true}
          indicatorDots={true}
          autoplay={true}>
             <SwiperItem>
              <View className='wallpaper-swiper' onClick={this.toWeather} style={weatherStore.weatherInfo.wea_img?{backgroundImage:'url(../../assets/images/weather/'+weatherStore.weatherInfo.wea_img+'.jpg)'}:""}></View>
              <View className="weather-local">{weatherStore.weatherInfo.municipalName+"-"+weatherStore.weatherInfo.city}</View>
              <View className="weather-tem">{weatherStore.weatherInfo.tem+"°"}</View>
              <View className="weather-info">
                <View><text decode="{{true}}">{weatherStore.weatherInfo.date+`&nbsp;&nbsp;`+weatherStore.weatherInfo.week}</text></View>
                <View className='icon icon-yun weather-temInfo'>{weatherStore.weatherInfo.wea+" "+weatherStore.weatherInfo.tem2+"°/"+weatherStore.weatherInfo.tem1+"°"}</View>
                
              </View>  
            </SwiperItem>
            <SwiperItem >
              <View className='demo-text'>历史上的今天</View>
            </SwiperItem>
            <SwiperItem >
              <View className='wallpaper-swiper' style={{backgroundImage:'url('+wallpaperStore.wallpaperUrl+')'}} onClick={this.toWallpaper}></View>
              <View className="wallpaper-title">每日壁纸</View>
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
                value: '藏头诗'
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