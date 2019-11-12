import Taro, { Component } from '@tarojs/taro'
import { View, Button , Image} from '@tarojs/components'
import { AtRate, AtToast, AtIcon, AtButton} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import {getCollectionInfo} from '../../../untils/movie-until'
import NavBar from '../../../components/NavBar'
import './movie-detail.scss'
const db = wx.cloud.database();
@inject('movieStore')
@inject('navStore')
@observer
class MovieDetail extends Component{
    config = {
        navigationBarTitleText: '影片详情',
        "navigationStyle": "custom"
    }
    state={
        hisStar:false,//是否收藏过
        now_id:'',//如收藏当前id
        btn:'展开',
        isStar:false,//是否收藏
        isLong:false,//文本是否超过3行
        btnShow:false,//简介展开收起按钮是否展示
        starSuc:false,//收藏成功
        unStar:false,//取消收藏suc
        unFail:false//操作失败
    }
    componentWillMount () {
        const { movieStore } = this.props;
        Taro.setNavigationBarTitle({
            title: movieStore.movieInfo.title?movieStore.movieInfo.title.split(" ")[0]:'影片详情'
        })
       
        //判断是否收藏
        this.isCollection();
        //判断历史收藏
        this.getCollectionHistory();
        console.log(movieStore.movieInfo)
    }
    componentDidMount () { 
        //小程序获取dom宽高方法
        let that = this;
        this.refDom.boundingClientRect(function (rect) {
            console.log(rect.height/20)
            if((rect.height/20)>3){
                that.setState({
                    isLong:true,
                    btnShow:true
                })
            }
        }).exec()
    }
    showSummary = () =>{
        if(this.state.isLong){
            this.setState({
                btn:'收起',
                isLong:false
            })
        }else{
            this.setState({
                btn:'展开',
                isLong:true
            })
        }     
    }
    //判断当前是否收藏
    isCollection = () =>{
        const {movieStore} = this.props;
        let userinfoStorage = Taro.getStorageSync('userInfo');
        let title = movieStore.movieInfo.title.split(" ")[0];
        let that = this;
        if(userinfoStorage.openid){
            db.collection('collection_movie').where({
                _openid: userinfoStorage.openid,
                title,
                star_flag:0,
            }).get().then(res=>{
                if(res.data[0]){
                    that.setState({
                        isStar:true,
                        now_id:res.data[0]._id
                    },()=>{
                        console.log(that.state)
                    })
                }
            })
        }
    }
    //判断该电影以前是否收藏过
    getCollectionHistory = () =>{
        const {movieStore} = this.props;
        let userinfoStorage = Taro.getStorageSync('userInfo');
        let title = movieStore.movieInfo.title.split(" ")[0];
        let that = this;
        if(userinfoStorage.openid){
            db.collection('collection_movie').where({
                _openid: userinfoStorage.openid,
                title,
                star_flag:1,
            }).get().then(res=>{
                if(res.data[0]){
                    that.setState({
                        hisStar:true,
                        now_id:res.data[0]._id
                    })
                }
            })
        }
    }
    //收藏/取消收藏
    addOrdelStar = () =>{
        const {movieStore} = this.props;
        let userinfoStorage = Taro.getStorageSync('userInfo');
        let that = this;
        if(userinfoStorage.openid){
            Taro.showLoading({title:'加载中....'});
            
            if(!(this.state.isStar)){
                //添加方法
                let d_idList = movieStore.movieInfo.alt.split('/');
                let d_id = d_idList[d_idList.length-2];
                let title = movieStore.movieInfo.title.split(" ")[0];
                //判断历史是否收藏过，true:将历史收藏flag变化，false:添加
                if(that.state.hisStar){
                    db.collection('collection_movie').doc(that.state.now_id).update({
                        data:{
                            star_time: new Date(),
                            star_flag:0
                        },
                        success:res=>{
                            Taro.hideLoading();
                            that.setState({
                                starSuc:true,
                                isStar:true
                            },()=>{
                                that.setBriefStar();
                            })
                        },
                        fail:err=>{
                            Taro.hideLoading();
                            that.setState({
                                unFail:true
                            })
                        }
                    })
                }else{
                    db.collection('collection_movie').add({
                        data:{
                            title,
                            d_id: d_id,
                            alt:movieStore.movieInfo.alt,
                            image:movieStore.movieInfo.image,
                            tags:movieStore.movieInfo.tags,
                            type:movieStore.movieInfo.type,
                            region:movieStore.movieInfo.region,
                            rate:movieStore.movieInfo.rate,
                            star_time: new Date(),
                            star_flag:0
                        },
                        success:results=>{
                            Taro.hideLoading();
                            that.setState({
                                starSuc:true,
                                isStar:true,
                                hisStar:true,
                                now_id:results._id
                            },()=>{
                                that.setBriefStar();
                            })
                        },
                        fail:err=>{
                            Taro.hideLoading();
                            console.log(err);
                            that.setState({
                                unFail:true
                            })
                        }
                    })
                }
            }else{
                //删除方法
                db.collection('collection_movie').doc(this.state.now_id).update({
                    data:{
                        star_flag:1
                    },
                    success:res=>{
                        Taro.hideLoading();
                        that.setState({
                            unStar:true,
                            hisStar:true,
                            isStar:false
                        },()=>{
                            that.setBriefStar();
                            console.log(this.state)
                        })
                    },
                    fail:err=>{
                        Taro.hideLoading();
                        console.log(err);
                        that.setState({
                            unFail:true
                        })
                    }
                })
            }
            
        }else{
            that.setState({
                starFail:true
            })
        }
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
    /**toast关闭触发 */
    closeStarSuc = () =>{
        this.setState({
            starSuc:false
        })
    }
    closeUnStarSuc = () =>{
        this.setState({
            unStar:false
        })
    }
    closeUnFail = () =>{
        that.setState({
            unFail:false
        })
    }
    render(){
        const { movieStore,navStore } = this.props;
        const navOption ={
            classtyle:"bar-basecolor",
            title:'影片详情',
            color:'#333',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
          }
        return (<View className="container">
                    <NavBar param={navOption}></NavBar>
                    <View className="detail-head" style={`padding-top:${navStore.navHeight+navStore.statusHeight+30}px`}>
                        
                            <Image className="movie-cover" src={movieStore.movieInfo.image}></Image>
                            <View className="movie-subinfo">
                                <View className="movie-title">{movieStore.movieInfo.title?movieStore.movieInfo.title.split(" ")[0]:''}</View>
                                <View className="movie-type">{movieStore.movieInfo.type?movieStore.movieInfo.type:''}</View>
                                <View className="movie-region">{movieStore.movieInfo.region}</View>
                                <View className="movie-time">{movieStore.movieInfo.releaseDate?movieStore.movieInfo.releaseDate:''}</View>
                                <View className="movie-time">{movieStore.movieInfo.filmLength?movieStore.movieInfo.filmLength:''}</View>
                                <View className="btn">
                                    <AtButton onClick={()=>{this.addOrdelStar(movieStore.movieInfo.title.split(" ")[0])}} size="small" className={this.state.isStar?" at-icon at-icon-heart-2 movie-button":" at-icon at-icon-heart movie-button"}><text decode="{{true}}" style="color:#333">&nbsp;{this.state.isStar?"已收藏":"收藏"}</text></AtButton>
                                </View>
                            </View>
                        
                            <View className="detail-rate">
                                <View  className="movie-rate">
                                    <View className="rate-title">评分</View>
                                    <View  className="rate">
                                        <View>{movieStore.movieInfo.rate?movieStore.movieInfo.rate:''}</View>
                                        <View className="rate-star">
                                            <AtRate max={10} value={movieStore.movieInfo.rate?movieStore.movieInfo.rate:0} />
                                            <View className="eye-cath">
                                                <View>{movieStore.movieInfo.betterthan[0]}</View>
                                                <View>{movieStore.movieInfo.betterthan[1]}</View>
                                            </View>
                                        </View>
                                        
                                    </View>
                                </View>
                                
                            </View>
                    </View>
                    <View className="detail-content">
                        <View className="introduce-title">
                            <View>简介</View>
                        </View>
                        <View>
                            <View ref={text => this.refDom = text} className={this.state.isLong?"introduce-hid":"introduce-view"}>
                                <View className="introduce-text">{movieStore.movieInfo.summary}</View>
                            </View>
                            <View>{(this.state.btnShow?<View className="show-text" onClick={()=>{this.showSummary()}}>{this.state.btn}</View>:"")}</View>
                        </View>
                    </View>
                    <View className="detail-footer">
                        <View className="performer-title">
                            <View>演职人员</View>
                        </View>
                        <View>
                            <View className="performer-view">导演:<text className="performer-text">{movieStore.movieInfo.director}</text></View>
                            <View className="performer-view">编剧:<text className="performer-text">{movieStore.movieInfo.screenWriter}</text></View>
                            <View className="performer-view">主演:<text className="performer-text">{movieStore.movieInfo.toStar}</text></View>
                        </View>
                    </View>
                    <AtToast isOpened={this.state.starSuc} text="收藏成功" icon="heart" onClose={this.closeStarSuc} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.unStar} text="取消收藏" icon="check" onClose={this.closeUnStarSuc} duration={1000}></AtToast>
                    <AtToast isOpened={this.state.unFail} text="啊哦,操作失败了" icon="close" onClose={this.closeUnFail} duration={1000}></AtToast>
                </View>)
    }
}
export default MovieDetail