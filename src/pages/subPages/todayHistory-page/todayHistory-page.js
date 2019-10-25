import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtCard, AtButton, AtNavBar} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import './TodayHistory-page.scss'

@inject('todayHistoryStore')
@observer
class TodayHistory extends Component{
    config = {
        navigationBarTitleText: '历史上的今天'
    }
    state={
        
    }
    componentWillMount () {

    }
    componentDidMount () { 
    }
    render(){
        const { todayHistoryStore } = this.props;
        return (<View className="container">
                    {todayHistoryStore.todayHistoryEven?todayHistoryStore.todayHistoryEven.map((item,index)=>{
                        return (<View className="card-info" key={"card"+index}>
                                    <View className="card-heard">
                                        <text decode="{{true}}">{item.date+'&nbsp;'+item.title}</text>
                                    </View>
                                    <View className="card-content">
                                        <View className={item.picUrl?'today-pic':"no-pic"} style={item.picUrl?{backgroundImage:'url('+item.picUrl+')'}:""}>
                                            {item.picUrl?"":'暂时还未收录图片'}
                                        </View>
                                        <View className="card-tip">
                                            <text decode="{{true}}">{item.content[0].trim()+'\n'+item.content[1].trim()}</text>
                                        </View>
                                    </View>
                                </View>)
                    }):''}
                </View>)
    }
}
export default TodayHistory