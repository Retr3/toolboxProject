import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator, Swiper, SwiperItem } from '@tarojs/components'
import { AtSearchBar, AtTabs, AtTabsPane, AtNavBar, AtList, AtListItem, AtIcon} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

import './movie-detail.scss'

@inject('movieStore')
@observer
class MovieDetail extends Component{
    config = {
        navigationBarTitleText: '影片详情'
    }
    state={
        movieName:''
    }
    componentWillMount () {
        const { movieStore } = this.props;
        Taro.setNavigationBarTitle({
            title: movieStore.movieInfo.title
          })
        console.log(movieStore.movieInfo)
    }
    componentDidMount () { 

    }

    render(){
        const { movieStore } = this.props;
        return (<View className="container">
                    <View className="detail-head"></View>
                    <View className="detail-content"></View>
                    <View className="detail-footer"></View>
                </View>)
    }
}
export default MovieDetail