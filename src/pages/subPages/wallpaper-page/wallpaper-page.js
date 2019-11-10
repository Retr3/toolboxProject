import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtToast,AtButton, AtIcon,AtNavBar} from 'taro-ui'
import './wallpaper-page.scss'
import { observer, inject } from '@tarojs/mobx'
/**
 * 壁纸推荐功能页
 */
@inject('wallpaperStore')
@inject('navStore')
@observer
class Wallpaper extends Component{
    config = {
        navigationBarTitleText: '壁纸推荐',
        "navigationStyle": "custom"
      }
    state={
        sucTip:false,
        failTip:false,
        sucText:'保存成功',
        failText:'保存失败'
    }
    componentDidMount () {
    }
    saveImg = ()=>{
        const { wallpaperStore } = this.props;
        let that = this;
        Taro.downloadFile({
            url:wallpaperStore.wallpaperUrl,
            success:function(res){
              let path = res.tempFilePath;
              console.log(path);
              Taro.saveImageToPhotosAlbum({
                filePath: path,
                success:saveres => {
                    that.setState({
                        sucTip:true,
                        failTip:false,
                        sucText:'保存成功'
                    })
                },
                fail:err=> {
                    that.setState({
                        sucTip:false,
                        failTip:true,
                        failText:'保存失败'
                    })
                }
              })
            },
            fail:err=> {
                that.setState({
                    sucTip:false,
                    failTip:true,
                    failText:'保存失败'
                })
            }
          })
    }
    onShareAppMessage(){
        const { wallpaperStore } = this.props;
        return {
            title: '这有张不错的壁纸，快来看看吧',
            imageUrl:wallpaperStore.wallpaperUrl
        }
    }
    goBackPre=()=>{
        Taro.navigateBack();
    }
    render(){
        const { wallpaperStore,navStore } = this.props;
        const enddate = wallpaperStore.nowDate.substring(0,4)+'-'
                +wallpaperStore.nowDate.substring(4,6)+'-'
                +wallpaperStore.nowDate.substring(6,wallpaperStore.nowDate.length)
        return (<View className="container">
                   
                    <View className="wallpaper-style" style={{backgroundImage: 'url('+wallpaperStore.wallpaperUrl+')'}}>
                        <View className="wallpaper-bar">
                            <View className="bar-transparent"  style={`height:${navStore.statusHeight}px;width:100%`}></View>
                            <View  style={`height:${70}px`}>
                                <AtNavBar
                                    className="bar-transparent"
                                    onClickLeftIcon={this.goBackPre}
                                    color='#fff'
                                    title=''
                                    leftText=''
                                    leftIconType='chevron-left'
                                />
                            </View>
                        </View>
                        
                        <View className="wallpaperMsg">
                            <View className="Msg-style">
                                {wallpaperStore.wallpaperMsg}
                            </View>
                            <View className="calendar-style">
                                {enddate}
                            </View>
                        </View>
                    </View>
                    <View className="wallpaper-act">
                        <AtButton className="share-btn at-icon at-icon-share" type="primary" openType="share"></AtButton>
                        <AtButton className="save-btn at-icon at-icon-download"  onClick={this.saveImg}></AtButton>
                    </View>
                    <AtToast isOpened={this.state.sucTip} 
                            duration={2000}
                            text={this.state.sucText} 
                            icon="check" >
                    </AtToast>
                    <AtToast isOpened={this.state.failTip} 
                            duration={2000}
                            text={this.state.failText} 
                            icon="close" >
                    </AtToast>
                </View>)
    }
}
export default Wallpaper