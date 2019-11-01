import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Image} from '@tarojs/components'
import { AtRate, AtDivider, AtIcon, AtSwipeAction, AtToast} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import {getCollectionInfo} from '../../../untils/movie-until'
import './movie-collection.scss'
const db = wx.cloud.database();
@inject('movieStore')
@observer
class MovieCollection extends Component{
    config = {
        navigationBarTitleText: '我的收藏',
        "enablePullDownRefresh": true
    }
    state={
        PAGE:5,
        nowPage:0,//当前页数
        more:true,//判断是否还有数据
        collectionList:[],
        noMovie:false,
        unStar:false,
        unFail:false
    }
    componentWillMount () {
        
    }
    componentDidShow(){
        console.log('show');
        this.getCollectionList(true);
    }
    componentDidMount () { 
        //this.getCollectionList();
    }
    //下拉刷新重载列表
    onPullDownRefresh() {
        console.log('pulldown')
        this.getCollectionList(true)
    }
    //下拉动作
    onReachBottom() {
        console.log("bottom")
        if(this.state.more){
            this.setState({
                nowPage: this.state.nowPage+1
            },()=>{
              console.log( this.state.nowPage)
              this.getCollectionList();
            })
        }
    }
    //获取收藏列表
    getCollectionList = init =>{
        if (init) {
            // 初始化
          this.setState({
            nowPage:0,
            more:true
          },()=>{
              this.getList(init);
          })
        }else{
            this.getList();
        }
       
    }
    gettest = ()=>{
        console.log(1);
    }
    //获取列表页
    getList = init =>{
        Taro.showNavigationBarLoading()
        Taro.showLoading({title:'加载中....'})
        let userinfoStorage = Taro.getStorageSync('userInfo');
        const offset = this.state.nowPage * this.state.PAGE;
        console.log(offset)
        let ret = db.collection('collection_movie').where({
            _openid: userinfoStorage.openid,
            star_flag:0
          }).orderBy('star_time', 'desc')
        if(offset>0){
          ret = ret.skip(offset)
        }
        ret = ret.limit(this.state.PAGE).get().then(res=>{
    
            if (res.data.length < this.state.PAGE && this.state.nowPage > 0) {
                this.setState({
                    more:false
                })
            }
            if (init) {
                let newList = res.data.map(item=>{
                    return {...item,isOpened:false}
                })
                this.setState({
                    collectionList:newList
                },()=>{
                    Taro.hideLoading()
                    Taro.stopPullDownRefresh();
                })
            } else {
                this.setState({
                    collectionList: [...this.state.collectionList, ...res.data]
                })
                // 下拉刷新，不能直接覆盖books 而是累加
            }
            Taro.hideLoading()
            Taro.hideNavigationBarLoading()
        })
    }
    //获取电影详情
    getMovieDetail = movieName =>{
        console.log(movieName)
        Taro.showLoading({title:'加载中....'})
        if(movieName){
            const {movieStore} = this.props;
            wx.cloud.callFunction({
                name:'getMovie',
                data:{
                    movieName
                },
                success:res => {
                    if(res.result){
                        movieStore.changeMovieInfo(res.result);
                        Taro.hideLoading();
                        this.toMovieDetail();
                    }else{
                        Taro.hideLoading()
                        this.setState({
                            noMovie:true
                        })
                    }
                },
                fail:err => {
                    console.log(err);
                }
            });
        }else{
            Taro.hideLoading()
            this.setState({
                noMovie:true
            })
        }
    }
    //删除收藏的影片
    delCollectionMovie = id =>{
        let that = this;
        db.collection('collection_movie').doc(id).update({
            data:{
                star_flag:1
            },
            success:res=>{
                that.setState({
                    unStar:true
                },()=>{
                    that.getCollectionList(true);
                    //that.state.collectionList
                    that.setBriefStar();
                })
            },
            fail:err=>{
                console.log(err);
                that.setState({
                    unFail:true
                })
            }
        })
    }
    //刷新上一页收藏展示
    setBriefStar = async ()=>{
    const { movieStore } = this.props;
    let briefStar = await getCollectionInfo();
        // this.setState({
        // briefStar
        // })
        movieStore.alterBriefStar(briefStar);
    }
    //滑块动作
    swipeHandleClick = (id,option)=>{
        if(option.action==='delete'){
            this.delCollectionMovie(id);
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
    //控制只显示单个
    handleSingle = index =>{
        let collectionList = this.state.collectionList.map(item=>{
            item.isOpened = false;
            return item;
        })
        collectionList[index].isOpened = true;
        this.setState({
            collectionList
        })
    }
    //轻提示关闭
    closeUnStar = ()=>{
        this.setState({
            unStar:false
        })
    }
    closeUnFail = ()=>{
        this.setState({
            unFail:false
        })
    }
    
    closeNoMovie = ()=>{
        this.setState({
            noMovie:true
        })
    }

    render(){
        const { movieStore } = this.props;
        const options = [
            {
              text: '取消',
              action:'cancel',
              style: {
                backgroundColor: '#6190E8'
              }
            },
            {
              text: '删除',
              action:'delete',
              style: {
                backgroundColor: '#FF4949'
              }
            }
        ];
        return (<View className="container">
                    {false?this.state.collectionList.map((item, index) => (
                        <AtSwipeAction
                        key={item._id}
                        autoClose={true}
                        onOpened={this.handleSingle.bind(this, index)}
                        isOpened={item.isOpened}
                        options={options}
                        class="star-swipe"
                        onClick={this.swipeHandleClick.bind(this,item._id)}
                        >
                            <View className="at-row star-item" onClick={()=>{this.getMovieDetail(item.title)}}>
                                <View className="at-col at-col-3 star-img" style={{backgroundImage:'url('+item.image+')'}}></View>
                                <View className="at-col at-col-7 star-info">
                                    <View className="star-title">{item.title}</View>
                                    <View className="star-text">{item.region}</View>
                                    <View className="star-text">{item.type}</View>
                                    <View className="star-rate">
                                        <AtRate max={5} value={(item.rate/2)} />
                                        <text decode="{{true}}">&nbsp;&nbsp;{item.rate}</text>
                                    </View>
                                </View>
                                <View className="at-col at-col-2 star-arrow at-icon at-icon-chevron-right"></View>
                            </View>
                        {/* <AtListItem 
                            title={item.title}
                            note={item.type}
                            extraText='详细信息'
                            arrow='right'
                            thumb={item.image}
                            onClick={()=>{this.getMovieDetail(item.title)}} /> */}
                        </AtSwipeAction>
                    )):<View className="no-collection">
                            <AtIcon className="no-text" prefixClass='icon' value='kong' size='40' color='#78A4FA'></AtIcon>
                            <View className="no-text">您还没有任何收藏</View>
                        </View>}
                    {
                        this.state.more?'':
                        <View className="divider-style" >
                            <AtDivider content='我是有底线的(*￣rǒ￣)'  fontColor='#ed3f14' lineColor='#ed3f14' />
                        </View>
                        
                            
                    }
                    <AtToast isOpened={this.state.unStar} text="删除成功" icon="check" onClose={this.closeUnStar} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.unFail} text="操作失败" icon="close" onClose={this.closeUnFail} duration={1000}></AtToast>
                </View>)
    }
}
export default MovieCollection