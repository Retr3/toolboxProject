import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator, Swiper, SwiperItem } from '@tarojs/components'
import { AtSearchBar, AtTabs, AtTabsPane, AtNavBar, AtList, AtListItem, AtIcon} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

import './movie-page.scss'

@inject('movieStore')
@observer
class WatchMovie extends Component{
    config = {
        navigationBarTitleText: '查电影'
    }
    state={
        movieName:'',
        current: 0,
        releaseMovieList:[],
        comingMovieList:[],
        isStar:false,//是否收藏
    }
    componentWillMount () {

    }
    componentDidMount () { 
        this.getNearMovie('release');
        this.getNearMovie('coming');
    }
    //获取近期上映和已经上映
    getNearMovie = movieFlag =>{
        wx.cloud.callFunction({
            name:'nearMovie',
            data:{
                movieFlag
            },
            success:res=>{
                console.log(res.result);
                if(movieFlag==='release'){
                    this.setState({
                        releaseMovieList:res.result
                    })
                }
                if(movieFlag==='coming'){
                    this.setState({
                        comingMovieList:res.result
                    })
                }
            },
            fail: err => {
                // handle error
                console.log("读取云端函数失败"+err);
            }
          })
    }
    //获取电影详情
    getMovieDetail = movieName =>{
        console.log(movieName);
        const {movieStore} = this.props;
        wx.cloud.callFunction({
            name:'getMovie',
            data:{
                movieName
            },
            success:res => {
                if(res.result){
                    movieStore.changeMovieInfo(res.result);
                    this.toMovieDetail();
                }else{
                    console.log("暂时没有收录该影片")
                }
            },
            fail:err => {
                console.log(err);
            }
        });
    }

    //点击左上角加入收藏
    addStar = item=>{
        //先判断是否登录
        //登录后入库
        //入库后查库
        //查库后返回加入state
    }
    //跳转到我的收藏
    toMyCollection = ()=>{
        console.log(this.state);
    }
    //跳转到影片详情页
    toMovieDetail = ()=>{
        Taro.navigateTo({
          url: './movie-detail',
          success: function(res) {
          },
          fail:function(err){
            console.log(err);
          }
        })
      }
    /**----基本方法---- */
    handelChange=value=>{
        this.setState({
            movieName:value
        })
    }
    //tab页切换，系统方法
    tabHandel=value=>{
        this.setState({
            current:value
        })
    }
    render(){
        const tabList = [{ title: '院线热映' }, { title: '即将上映' }]
        return (<View className="container">
                    <View className="search-body">
                        <AtSearchBar
                            name='getMovieName'
                            title=''
                            placeholder='搜索'
                            value={this.state.movieName}
                            onChange={this.handelChange.bind(this)}
                            onActionClick={this.getMovieDetail.bind(this)}
                        />
                    </View>

                    <View>
                        <AtTabs 
                            current={this.state.current} 
                            tabList={tabList}
                            animated={false} 
                            onClick={this.tabHandel}>
                            <AtTabsPane current={this.state.current} index={0} >
                                <View>
                                    <Swiper
                                        className='release-list'
                                        displayMultipleItems={3}
                                        vertical={false}
                                        circular={false}
                                        indicatorDots={false}
                                        autoplay={false}>
                                            {
                                                this.state.releaseMovieList?this.state.releaseMovieList.map((item,index)=>{
                                                    return <SwiperItem key={item.id}>
                                                                <View className='release-info' 
                                                                    style={{backgroundImage:'url('+item.img+')'}}
                                                                    onClick={()=>{this.getMovieDetail(item.nm)}}>
                                                                </View>
                                                                <View className="movie-nostar at-icon at-icon-heart-2" onClick={()=>{this.addStar(item)}}></View>
                                                                <View className="release-title">{item.nm}</View>
                                                                <View className="release-tip">{item.rt}</View>
                                                            </SwiperItem>
                                                }):""
                                            }
                                    </Swiper>
                                </View>
                            </AtTabsPane>
                            <AtTabsPane current={this.state.current} index={1}>
                                <View>
                                    <Swiper
                                        className='coming-list'
                                        displayMultipleItems={3}
                                        vertical={false}
                                        circular={false}
                                        indicatorDots={false}
                                        autoplay={false}>
                                        {
                                            this.state.comingMovieList?this.state.comingMovieList.map((item,index)=>{
                                                return <SwiperItem key={item.id}>
                                                            <View className='release-info' 
                                                                style={{backgroundImage:'url('+item.img+')'}}
                                                                onClick={()=>{this.getMovieDetail(item.nm)}}>
                                                            </View>
                                                            <View className="movie-nostar at-icon at-icon-heart-2"></View>
                                                            <View className="release-title">{item.nm}</View>
                                                            <View className="release-tip">{item.comingTitle.split(" ")[0]}</View>
                                                        </SwiperItem>
                                            }):''
                                        }
                                    </Swiper>
                                </View>
                            </AtTabsPane>
                        </AtTabs>
                    </View>
                    
                    {/* <View className="collection-title">
                        <View>我的收藏</View>
                        <View><Button  className='at-icon at-icon-chevron-right'></Button></View>
                    </View> */}
                    <AtList hasBorder={false}>
                    <AtListItem  key={'star'} title='我的收藏' extraText='更多' arrow='right' iconInfo={{ size:
                    25, color: '#78A4FA', value: 'bookmark', }} />
                    </AtList>
                    <View className="collection-view">
                        {this.state.isStar?<View></View>
                        :<View className="no-collection">
                            <AtIcon className="no-text" prefixClass='icon' value='kong' size='40' color='#222'></AtIcon>
                            <View className="no-text">您还没有任何收藏</View>
                        </View>}
                    </View>
                </View>)
    }
}
export default WatchMovie