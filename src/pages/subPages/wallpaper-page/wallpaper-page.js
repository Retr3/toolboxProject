import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtToast,AtButton, AtIcon} from 'taro-ui'
import './wallpaper-page.scss'
import { observer, inject } from '@tarojs/mobx'
/**
 * 壁纸推荐功能页
 */
@inject('wallpaperStore')
@observer
class Wallpaper extends Component{
    config = {
        navigationBarTitleText: '壁纸推荐'
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
    render(){
        const { wallpaperStore } = this.props;
        const enddate = wallpaperStore.nowDate.substring(0,4)+'-'
                +wallpaperStore.nowDate.substring(4,6)+'-'
                +wallpaperStore.nowDate.substring(6,wallpaperStore.nowDate.length)
        return (<View>
                    
                    <View className="wallpaper-style" style={{backgroundImage: 'url('+wallpaperStore.wallpaperUrl+')'}}>
                        {/* <Image className="wallpaper-style" src={} /> */}
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
                        <AtButton className="share-btn at-icon at-icon-share" type="primary" size="small" openType="share"><text  decode="{{true}}">&nbsp;分享给朋友</text></AtButton>
                        <AtButton className="save-btn at-icon at-icon-download" size="small" onClick={this.saveImg}><text  decode="{{true}}">&nbsp;保存到相册</text></AtButton>
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