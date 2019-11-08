import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Image} from '@tarojs/components'
import { AtIcon, AtSwipeAction, AtToast} from 'taro-ui'
import {calendarBgUrl} from '../../../untils/untils'
import {dateFormat} from '../../../untils/tool'

import './calendar-page.scss'
const db = wx.cloud.database();
class Calendar extends Component{
    config = {
        navigationBarTitleText: '黄历'
      }
    state={
        calendarInfo:'',
        yiList:[],
        jiList:[],
        jishen:[],
        xiongshen:[]
    }
    componentWillMount () {
        
    }
    componentDidShow(){
    }
    componentDidMount () { 
        let nowDate = new Date();
        let yangli = dateFormat('YYYY-mm-dd',nowDate);
        db.collection('calendar_info').where({
            yangli
        }).get().then(res=>{
            this.setState({
                calendarInfo:res.data[0],
                yiList:res.data[0].yi.split(' ').splice(0,15),
                jiList:res.data[0].ji.split(' ').splice(0,15),
                jishen:res.data[0].jishen.split(' '),
                xiongshen:res.data[0].xiongshen.split(' ')
            },()=>{
                console.log(this.state);
            })
        })
    }
    onShareAppMessage(){
        return {
            title: '快来看看今天的黄历吧'
        }
    }
    render(){
        return (<View className="container" style={{backgroundImage:'url('+calendarBgUrl+')'}}>
                    {this.state.calendarInfo?
                    <View>
                        <View className="calendar-head">
                            <View className="calendar-info">
                                <text decode="{{true}}">{this.state.calendarInfo.yangli+"&nbsp;&nbsp;星期" + "日一二三四五六".charAt(new Date().getDay())}</text>
                            </View>
                            <View className="calendar-date">{(new Date().getDate())}</View>
                            <View className="calendar-info"><text decode="{{true}}">{"农历&nbsp;&nbsp;"+this.state.calendarInfo.yinli}</text></View>
                            <View className="calendar-baiji">
                                <View className="baiji-info"><text decode="{{true}}">{'五行:&nbsp;'+this.state.calendarInfo.wuxing}</text></View>
                                <View className="baiji-info"><text decode="{{true}}">{'彭祖百忌:&nbsp;'+this.state.calendarInfo.baiji}</text></View>
                            </View>
                        </View>
                        <View className="calendar-content">
                            <View className="at-row">
                                <View className="at-col at-col-6 calendar-border-right">
                                    <View className="at-row calendar-icon">
                                        <AtIcon prefixClass='icon' value='yi' size='40' color='#CC0000'></AtIcon>
                                    </View>
                                    <View className="at-row at-row--wrap calendar-subinfo">
                                        {this.state.yiList.length>0?this.state.yiList.map(item=>
                                            <View key={item} className='at-col at-col-4 calendar-text'>{item}</View>
                                        ):''}
                                    </View>
                                    <View className="at-row at-row--wrap foot-info">
                                            <View className="at-col at-col-12 foot-title">吉神宜趋</View>
                                            {this.state.jishen.length>0?this.state.jishen.map(item=>{
                                                return <View key={item} className='at-col at-col-4 foot-text'>{item}</View>
                                            }):''}
                                            
                                    </View>
                                </View>

                                <View className="at-col at-col-6">
                                    <View className="at-row calendar-icon">
                                        <AtIcon prefixClass='icon' value='ji' size='40' color='#333333'></AtIcon>
                                    </View>
                                    <View className="at-row at-row--wrap calendar-subinfo">
                                        {this.state.jiList.length>0?this.state.jiList.map((item,index)=>
                                            <View key={item} className='at-col at-col-4 calendar-text'>{item}</View>
                                        ):''}
                                    </View>
                                    <View className="at-row at-row--wrap foot-info">
                                            <View className="at-col at-col-12 foot-title2">凶煞宜忌</View>
                                            {this.state.xiongshen.length>0?this.state.xiongshen.map(item=>{
                                                return <View key={item} className='at-col at-col-4 foot-text'>{item}</View>
                                            }):''}
                                            
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>:<View></View>}
                </View>)
    }
}
export default Calendar