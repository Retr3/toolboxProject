import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator, Swiper, SwiperItem } from '@tarojs/components'
import { AtSearchBar, AtTabs, AtTabsPane, AtToast , AtList, AtListItem, AtIcon} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import {getCollectionInfo} from '../../../untils/movie-until'
import './movie-page.scss'
const db = wx.cloud.database();
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
        nullShow:false,
        starShow:false,//收藏提示
        starError:false,//收藏失败提示
        noStarShow:false,//取消收藏成功
        starIsNull:false,//收藏为空提示
        //briefStar:[]
    }
    async componentWillMount () {
       await this.getNearMovie('release');
       await this.getNearMovie('coming');
    }
   async componentDidMount () { 
        this.setBriefStar();
    }

    //获取近期上映和已经上映
    getNearMovie = movieFlag =>{
        wx.cloud.callFunction({
            name:'nearMovie',
            data:{
                movieFlag
            },
            success:async res=>{
                if(movieFlag==='release'){
                    let that = this;
                    let releaseInfo = [];
                    for(let item of res.result){
                        let hasStar="no";
                        await that.getMyCollectionList(item.nm).get().then(starRes=>{
                            if(starRes.data[0]){
                                hasStar="has";
                            }
                            releaseInfo.push({...item,hasStar})
                        })
                    }
                    this.setState({
                        releaseMovieList:releaseInfo
                    })
                        
                }
                if(movieFlag==='coming'){
                    let that = this;
                    let comingInfo = [];
                    for(let item of res.result){
                        let hasStar="no";
                        await that.getMyCollectionList(item.nm).get().then(starRes=>{
                            if(starRes.data[0]){
                                hasStar="has";
                            }
                            comingInfo.push({...item,hasStar})
                        })
                    }
                    this.setState({
                        comingMovieList:comingInfo
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
        Taro.showLoading({title:'加载中....'})
        if(movieName){
            const {movieStore} = this.props;
            wx.cloud.callFunction({
                name:'getMovie',
                data:{
                    movieName
                },
                success:res => {
                    Taro.hideLoading();
                    if(res.result){
                        movieStore.changeMovieInfo(res.result);
                        this.toMovieDetail();
                    }else{
                        console.log("暂时没有收录该影片")
                    }
                },
                fail:err => {
                    Taro.hideLoading();
                    console.log(err);
                }
            });
        }else{
            Taro.hideLoading();
            this.setState({
                nullShow:true
            })
        }
    }
    //在我的收藏中查找
    getMyCollectionList = movieName=>{
        let userinfoStorage = Taro.getStorageSync('userInfo');
        return db.collection('collection_movie').where({
            _openid: userinfoStorage.openid,
            star_flag:0,
            title:movieName
          })
    }
    //查找收藏列表前三数据
    getCollectionInfo = async ()=>{
        let userinfoStorage = Taro.getStorageSync('userInfo');
        let collectionInfo = [];
        await db.collection('collection_movie').where({
            _openid: userinfoStorage.openid,
            star_flag:0
          }).orderBy('star_time', 'asc').limit(this.state.PAGE).get().then(
            res=>{
                collectionInfo = res.data
            }
          )
        return collectionInfo;
    }
    //收藏缩略展示
    setBriefStar = async ()=>{
       const { movieStore } = this.props;
       let briefStar = await getCollectionInfo();
        // this.setState({
        // briefStar
        // })
        movieStore.alterBriefStar(briefStar);
    }
    //点击左上角加入收藏
    addStar = (item,index,flag)=>{
        //先判断是否登录 v
        //登录后入库
        //入库后查库
        //查库后返回加入state
        //未收藏->收藏
        let userinfoStorage = Taro.getStorageSync('userInfo');
        let starlist ;
        let that = this;
        flag==='release'?starlist = this.state.releaseMovieList:starlist = this.state.comingMovieList
        if(item.hasStar==='no'){
            starlist[index].hasStar = 'has';
            if(userinfoStorage.openid){
                wx.cloud.callFunction({
                    name:'getMovie',
                    data:{
                        movieName:item.nm
                    },
                    success:res => {
                        if(res.result){
                            let d_idList = res.result.alt.split('/');
                            let d_id = d_idList[d_idList.length-2];
                            db.collection('collection_movie').where({
                                _openid: userinfoStorage.openid,
                                title:item.nm,
                                star_flag:1,
                            }).get().then(
                                newres=>{
                                    if(newres.data[0]){
                                        db.collection('collection_movie').doc(newres.data[0]._id).update({
                                            data:{
                                                star_time: new Date(),
                                                star_flag:0
                                            },
                                            success:res=>{
                                                if(flag==="release"){
                                                    that.setState({
                                                        releaseMovieList:starlist,
                                                        starShow:true
                                                    },()=>{
                                                        that.setBriefStar();
                                                    })
                                                }else{
                                                    that.setState({
                                                        comingMovieList:starlist,
                                                        starShow:true
                                                    },()=>{
                                                        that.setBriefStar();
                                                    })
                                                }
                                               
                                            },
                                            fail:err=>{
                                                that.setState({
                                                    starError:true
                                                })
                                            }
                                        })
                                    }else{
                                        db.collection('collection_movie').add({
                                            data:{
                                                title:item.nm,
                                                d_id: d_id,
                                                alt:res.result.alt,
                                                image:res.result.image,
                                                tags:res.result.tags,
                                                type:res.result.type,
                                                region:res.result.region,
                                                rate:res.result.rate,
                                                star_time: new Date(),
                                                star_flag:0
                                            },
                                            success:results=>{
                                                console.log("收藏成功");
                                                if(flag==="release"){
                                                    that.setState({
                                                        releaseMovieList:starlist,
                                                        starShow:true
                                                    },()=>{
                                                        that.setBriefStar();
                                                    })
                                                }else{
                                                    that.setState({
                                                        comingMovieList:starlist,
                                                        starShow:true
                                                    },()=>{
                                                        that.setBriefStar();
                                                    })
                                                }
                                            },
                                            fail:err=>{
                                                console.log(err);
                                                that.setState({
                                                    starError:true
                                                })
                                            }
                                        })
                                    }
                                }
                            )
                            
                             
                        }else{
                            console.log("暂时没有收录该影片")
                            this.setState({
                                starError:true
                            })
                        }
                    },
                    fail:err => {
                        console.log(err);
                    }
                });
            }else{
                console.log('未登录')
            }
        }else{
            //收藏->取消
            starlist[index].hasStar = 'no';
            db.collection('collection_movie').where({
                _openid: userinfoStorage.openid,
                title:item.nm,
                star_flag:0,
              }).get().then(res=>{
                    db.collection('collection_movie').doc(res.data[0]._id).update({
                        data:{
                            star_flag:1
                        },
                        success:res=>{
                            if(flag==="release"){
                                that.setState({
                                    releaseMovieList:starlist,
                                    noStarShow:true
                                },()=>{
                                    that.setBriefStar();
                                })
                            }else{
                                that.setState({
                                    comingMovieList:starlist,
                                    noStarShow:true
                                },()=>{
                                    that.setBriefStar();
                                })
                            }
                        },
                        fail:err=>{
                        console.log(err);
                        }
                    })
              })
        }
        
    }
    //跳转
    //跳转到我的收藏
    toMyCollection = ()=>{
        const { movieStore } = this.props;
        if(movieStore.briefStar.length>0){
            Taro.navigateTo({
                url: './movie-collection',
                success: function(res) {
                },
                fail:function(err){
                  console.log(err);
                }
              })
        }else{
            this.state({
                starIsNull:true
            })
        }
        
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
    //轻提示关闭
    closeNullShow=()=>{
        this.setState({
            nullShow:false
        })
    }
    closeStarShow=()=>{
        this.setState({
            starShow:false
        })
    }
    closeStarError=()=>{
        this.setState({
            starError:false
        })
    }
    closeNoStar=()=>{
        this.setState({
            noStarShow:false
        })
    }
    closeStarIsNull=()=>{
        this.setState({
            starIsNull:false
        })
    }
    render(){
        const { movieStore } = this.props;
        const tabList = [{ title: '院线热映' }, { title: '即将上映' }]
        return (<View className="container">
                    <View className="search-body">
                        <AtSearchBar
                            name='getMovieName'
                            title=''
                            placeholder='搜索'
                            value={this.state.movieName}
                            onChange={this.handelChange.bind(this)}
                            onActionClick={()=>this.getMovieDetail(this.state.movieName)}
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
                                                                <View className={item.hasStar==='no'?"movie-nostar at-icon at-icon-heart-2":"movie-isstar at-icon at-icon-heart-2"} onClick={(e)=>{this.addStar(item,index,'release')}}></View>
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
                                                            <View className={item.hasStar==='no'?"movie-nostar at-icon at-icon-heart-2":"movie-isstar at-icon at-icon-heart-2"} onClick={(e)=>{this.addStar(item,index,'coming')}}></View>
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
                  
                    <AtList hasBorder={false}>
                    <AtListItem  key={'star'} title='我的收藏' extraText='更多' arrow='right' iconInfo={{ size:
                    25, color: '#78A4FA', value: 'bookmark', }} onClick={this.toMyCollection} />
                    </AtList>
                    <View className="collection-view">
                        {movieStore.briefStar.length>0?<View className="at-row">
                            {movieStore.briefStar.map((item,index)=>{
                                return <View key={item._id} className="at-col at-col-4">
                                                <View className='collection-info' 
                                                    style={{backgroundImage:'url('+item.image+')'}}
                                                    onClick={()=>{this.getMovieDetail(item.title)}}>
                                                </View>
                                                <View className="collection-title">{item.title}</View>
                                                <View className="collection-tip">{item.region}</View>
                                                <View className="collection-tip">{item.type}</View>
                                        </View>
                            })}
                        </View>
                        :<View className="no-collection">
                            <AtIcon className="no-text" prefixClass='icon' value='kong' size='40' color='#78A4FA'></AtIcon>
                            <View className="no-text">您还没有任何收藏</View>
                        </View>}
                    </View>
                    <AtToast isOpened={this.state.nullShow} text="输入不能为空哦" onClose={this.closeNullShow} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.starShow} text="收藏成功" icon="heart" onClose={this.closeStarShow} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.starError} text="收藏失败" icon="close" onClose={this.closeStarError} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.noStarShow} text="取消收藏" icon="check" onClose={this.closeNoStar} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.starIsNull} text="收藏为空哦" icon="check" onClose={this.closeStarIsNull} duration={1000}></AtToast>
                </View>)
    }
}
export default WatchMovie