import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Swiper, SwiperItem } from '@tarojs/components'
import { AtGrid, AtToast, AtIcon, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import NavBar from '../../components/NavBar'
import './index.scss'
import {weatherApi} from '../../untils/weather-api'
import { qqMapKey,weatherImgUrl,weatherIconUrl,codeJsonUrl } from '../../untils/untils';
import {getNavHeight} from '../../untils/nav-height'
// import '../../assets/icon/bingbao.png'
// import '../../assets/icon/lei.png'
// import '../../assets/icon/qing.png'
// import '../../assets/icon/shachen.png'
// import '../../assets/icon/wu.png'
// import '../../assets/icon/xue.png'
// import '../../assets/icon/yin.png'
// import '../../assets/icon/yu.png'
// import '../../assets/icon/yun.png'

const QQMapWX = require('../../untils/qqmap-wx-jssdk.js');

const db = wx.cloud.database();
const qqmapsdk = new QQMapWX({
  key: qqMapKey
});
@inject('wallpaperStore')
@inject('weatherStore')
@inject('todayHistoryStore')
@inject('navStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    "navigationStyle": "custom"
  }
  state = {
    toastOpen:false,
    errorToast:false,
    wallpaperUrl:'',
    wallpaperMsg:'',
    newImgName:'',
    hisPicUrl:'',
    hisTitle:[],
    limiter:0,
    loginModal:false,//登录模态框
    loginSuc:false, //登录成功轻提醒
    weatherLoad:false//天气加载
  }
  
  componentWillMount () {
    //导航栏高度写入
    const { navStore } = this.props;
    navStore.setNavHeight(getNavHeight().navheight);
    navStore.setStatusHeight(getNavHeight().statusHeight);
    let windowsWidth = Taro.getSystemInfoSync().windowWidth;
    let windowsHeight = Taro.getSystemInfoSync().windowHeight;
    let resolution = '480';
    if(windowsWidth>700 && windowsHeight>900){
        resolution = '768x0';
    }
    this.judgeWallpaper(resolution);
  }

  componentWillReact () {
    
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
           //请求云存储获取地市json表
            Taro.request({
              url:codeJsonUrl,
              success (res) {
                console.log("请求云存储");
                let cityCode = res.data;
                 //如果定位失败，显示默认地址
                cityCode[cityMark]?cityId = cityCode[cityMark].id : cityId = cityCode['北京北京北京'].id
                //
                db.collection('live_weather').where({
                  cityid:cityId
                }).get({
                  success:cityRes=>{
                    let newCityId = cityId;
                    let cityflag = 'new';
                    if(cityRes.data[0]){
                      newCityId = cityRes.data[0].cityid;
                      cityflag = 'old';
                    }
                    //获取天气接口
                  weatherApi(newCityId,cityflag).then(res=>{
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
                  fail:err=>{
                      console.log(err)
                  }
                })
              }
            })
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
    let nowDate = new Date().getTime();
    this.getTodayHistoryInfo(nowDate);
  }
  //网格跳转
  toToolPage=(item)=>{
    const toolType = item.iconInfo.value || "";
    const that = this;
    switch(toolType){
      case 'chart':
          Taro.navigateTo({
            url: '../subPages/shoppingHistory-page/shoppingHistory-page',
            
            fail:function(err){
              console.log(err);
              that.setState({
                errorToast:true
              })
            }
          })
          return 
      case 'movie':
          let userinfoStorage = Taro.getStorageSync('userInfo');
          if(userinfoStorage.openid){
            Taro.navigateTo({
              url: '../subPages/movie-page/movie-page',
              
              fail:function(err){
                console.log(err);
                that.setState({
                  errorToast:true
                })
              }
            })
          }else{
            this.setState({
              loginModal:true
            })
          }
          
          return
      case 'calendar':
          Taro.navigateTo({
            url: '../subPages/calendar-page/calendar-page',
            success: function(res) {},
            fail:err=>{
              console.log(err);
            }
          })
          return
      case 'exchange-rate':
        Taro.navigateTo({
          url: '../subPages/exchangeRate-page/exchangeRate-page',
          success: function(res) {},
          fail:err=>{
            console.log(err);
          }
        })
          return
      case 'search':
        Taro.navigateTo({
          url: '../subPages/poem-page/poem-page',
          success: function(res) {},
          fail:err=>{
            console.log(err);
          }
        })
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
                      env:'你的环境变量'
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
  //跳转历史今天页面
  toTodayHistory = ()=>{
    Taro.navigateTo({
      url: '../subPages/todayHistory-page/todayHistory-page',
      success: function(res) {
      },
      fail:function(err){
        console.log(err);
      }
    })
  }
  //获取历史数据
  //如果没有查到今天递归查询前5天的
  getTodayHistoryInfo = (time)=> {
    const { todayHistoryStore } = this.props;
    let myDate = new Date();
    myDate.setTime(time);
    let nowDate = (myDate.getMonth()+1) + "/" + myDate.getDate();
   //历史今天数据
   db.collection('today_history').where({
     day:nowDate
   }).orderBy('e_id', 'asc').get({
     success:res=>{
       if(res.data.length>0){
         let picList = res.data.filter(item=>item.picUrl);
         this.setState({
           hisPicUrl:picList[0].picUrl,
           hisTitle:[res.data[0].title,res.data[1].title,res.data[2].title]
         },()=>{
           todayHistoryStore.changeTodayHistoryEven(res.data);
         })
       }else{
         this.setState({
          limiter:this.state.limiter++
         },()=>{
          let yeDate = time-24*60*60*1000;
          this.state.limiter<5?this.getTodayHistoryInfo(yeDate):'';
         })
         
       }
     },
     fail:err=>{
       console.log(err);
     } 
   })
  }
  //获取文件临时路径 有效期:48hour
  pathchange = fileid=>{
    return wx.cloud.getTempFileURL({
      fileList:[fileid],
      maxAge: 60 * 60 * 48})
  }
  onGetUserInfo=(e)=>{
    let that = this;
    let userInfo = e.detail.userInfo;
    wx.cloud.callFunction({
        name:'login',
        success:res=>{
          console.log(res.result);
          if(userInfo){
            userInfo.openid = res.result.openid
            this.setState({
                userInfo
            },()=>{
                Taro.setStorageSync("userInfo",userInfo);
                that.setState({
                  loginSuc:true,
                  loginModal:false
                },()=>{
                  Taro.navigateTo({
                    url: '../subPages/movie-page/movie-page',
                    success: function(res) {
                        console.log(res);
                        that.setState({
                          loginSuc:false
                        })
                    },
                    fail:function(err){
                      console.log(err);
                      that.setState({
                        errorToast:true
                      })
                    }
                  })
                })
            })
          }
        }

    })
  }
  //
  loginCancel = ()=>{
    this.setState({
      loginModal:false
    })
  }
  //关闭动作
  ontoastClose = ()=>{
    this.setState({
      toastOpen:false
    })
  }
  onerrorClose = ()=>{
    this.setState({
      errorToast:false
    })
  }
  onLoginClose = ()=>{
    this.setState({
      loginSuc:false
    })
  }
  render () {
    const { wallpaperStore,weatherStore,navStore } = this.props;
    const navOption ={
      classtyle:"bar-index",
      navstyle:'bar-index',
      title:'首页',
      color:'#333',
      leftIconType:"index",
      statusHeight:navStore.statusHeight,
      navHeight:navStore.navHeight
    }
    return (
      <View className="container">
        <NavBar param={navOption}></NavBar>
        <View style={`margin-top:${navStore.navHeight+navStore.statusHeight}px`}>
          <View>
            <Swiper
            className='test-h'
            indicatorColor='#999'
            indicatorActiveColor='#333'
            vertical={false}
            interval={5000}
            circular={true}
            indicatorDots={true}
            autoplay={true}>
              <SwiperItem>
                {
                  weatherStore.weatherInfo?
                  <View>
                      <View className='wallpaper-swiper' style={weatherStore.weatherInfo.wea_img?{backgroundImage:'url('+weatherImgUrl+weatherStore.weatherInfo.wea_img+'.jpg)'}:""}></View>
                      <View className='weather-bg' onClick={this.toWeather} ></View>
                      <View className="weather-local">{weatherStore.weatherInfo.municipalName?weatherStore.weatherInfo.municipalName+"-"+weatherStore.weatherInfo.city:''}</View>
                      <View className="weather-tem">{weatherStore.weatherInfo.tem?weatherStore.weatherInfo.tem+"°":''}</View>
                      <View className="weather-icon" style={weatherStore.weatherInfo.wea_img?{backgroundImage:'url('+weatherIconUrl+weatherStore.weatherInfo.wea_img+'.png)'}:""}></View>
                      <View className="weather-info">
                          <View className="wea-update"><text decode="{{true}}">{weatherStore.weatherInfo.update_time?weatherStore.weatherInfo.update_time+`&nbsp;更新`:''}</text></View>
                          <View><text decode="{{true}}">{weatherStore.weatherInfo.date?weatherStore.weatherInfo.date+`&nbsp;&nbsp;`+weatherStore.weatherInfo.week:''}</text></View>
                          <View className='weather-temInfo'>
                            {weatherStore.weatherInfo.wea?weatherStore.weatherInfo.wea+" "+weatherStore.weatherInfo.tem2+"°/"+weatherStore.weatherInfo.tem1+"°":''}
                          </View>
                      </View>
                    </View>
                  :
                    <View className='wallpaper-positioning'>
                      <View><AtIcon className="icon-position" prefixClass='icon' value='position-2' size='50' color='#4395ff'></AtIcon></View>
                      <View className="positon-text">定位中,请稍等</View>
                    </View>
                }
              </SwiperItem>
              <SwiperItem >
                <View className='history-swiper' style={{backgroundImage:'url('+this.state.hisPicUrl+')'}}></View>
                <View className='history-bg' onClick={this.toTodayHistory} ></View>
                <View className='history-title'>历史上的今天</View>
                <View className='history-info'>
                  <View className="at-icon at-icon-clock history-text"><text decode="{{true}}">{'&nbsp;'+this.state.hisTitle[0]}</text></View>
                  <View className="at-icon at-icon-clock history-text"><text decode="{{true}}">{'&nbsp;'+this.state.hisTitle[1]}</text></View>
                  <View className="at-icon at-icon-clock history-text"><text decode="{{true}}">{'&nbsp;'+this.state.hisTitle[2]}</text></View> 
                </View>
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
                    color:'#2ae542'
                  },
                  value: '商品历史价'
                },
                {
                  iconInfo:{
                    prefixClass:'icon',
                    size: 30,
                    value:'movie',
                    color:'#e5342a'
                  },
                  value: '电影评分'
                },
                {
                  iconInfo:{
                    size: 30,
                    value:'calendar',
                    color:'#2a85e5'
                  },
                  value: '老黄历'
                },{
                  iconInfo:{
                    prefixClass:'icon',
                    size: 30,
                    value:'exchange-rate',
                    color:'#e52a42'
                  },
                  value: '汇率'
                },{
                  iconInfo:{
                    prefixClass:'icon',
                    size: 30,
                    value:'search',
                    color:'#e58a2a'
                  },
                  value: '作首诗'
                },{
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
        </View>
       
        <AtToast isOpened={this.state.toastOpen}
                onClose ={this.ontoastClose}
                duration={1000}
                text="敬请期待" 
                icon="heart" >
        </AtToast>
        <AtToast isOpened={this.state.errorToast} 
                onClose ={this.onerrorClose}
                duration={1000}
                text={`啊哦,出错了\n  o(>_<)o`}
                icon="close-circle" >
        </AtToast>
        <AtToast isOpened={this.state.loginSuc} 
                duration={1000}
                onClose ={this.onLoginClose}
                text="登录成功" 
                icon="check" >
        </AtToast>
        <AtModal isOpened={this.state.loginModal} closeOnClickOverlay={false}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent className="login-model">
            <View>该功能需要登录哦</View>
          </AtModalContent>
          <AtModalAction> 
            <Button onClick={this.loginCancel}>不了,谢谢</Button> 
            <Button  onGetUserInfo={this.onGetUserInfo}
                     open-type="getUserInfo">一键登录</Button> 
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default Index 
