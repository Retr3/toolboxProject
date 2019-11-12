import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import NavBar from '../../../components/NavBar'
import './TodayHistory-page.scss'

@inject('navStore')
@inject('todayHistoryStore')
@observer
class TodayHistory extends Component{
    config = {
        navigationBarTitleText: '往日回忆',
        "navigationStyle": "custom"
    }
    state={
        
    }
    componentWillMount () {

    }
    componentDidMount () { 
    }
    goBackPre=()=>{
        Taro.navigateBack();
    }
    render(){
        const { todayHistoryStore,navStore } = this.props;
        const navOption ={
            classtyle:"bar-basecolor",
            title:'历史上的今天',
            color:'#333',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
            }
        return (<View className="container">
                    <NavBar param={navOption}></NavBar>
                    <View style={`margin-top:${navStore.navHeight+navStore.statusHeight+10}px`}>
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
                    </View>
                    
                </View>)
    }
}
export default TodayHistory