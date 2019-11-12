import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import { weatherIconUrl } from '../../../untils/untils';
import {divSevenDays} from '../../../untils/weather-api'
import NavBar from '../../../components/NavBar'
import './weather-page.scss'
@inject('weatherStore')
@inject('navStore')
@observer
class Weather extends Component{
    config = {
        navigationBarTitleText: '今日天气',
        "navigationStyle": "custom"
      }
    state = {
        air_tips:'',
        air_level:'',
        win_speed:'',
        raysLevel:'',//紫外线等级
        raysIndex:'',//紫外线指数
        bloodSugarLevel:'',//血糖等级
        bloodSugarIndex:'',//血糖指数
        clothLevel:'',//穿衣等级
        clothesIndex:'',//穿衣指数
        carWashLevel:'',//洗车等级
        carWashIndex:'',//洗车指数
        backgroundClass:'',
        recentlyWeaData:''//七天天气数据
    }
    componentWillMount () {
        const {weatherStore} = this.props;
        let weaFlag = weatherStore.weatherInfo.wea_img;
        let cityid = weatherStore.weatherInfo.cityid;
        if(weaFlag==="qing"||weaFlag==="yun"){
            this.setState({
                backgroundClass:'fineDay-background'
            })
        }else{
            this.setState({
                backgroundClass:'overcast-background'
            })
        }
        divSevenDays(cityid).then(res=>{
            console.log(res.data);
            let data = res.data;
            this.setState({
                air_tips:data[0].air_tips,
                air_level:data[0].air_level,
                win_speed:data[0].win_speed,
                raysLevel:data[0].index[0].level,
                raysIndex:data[0].index[0].desc,
                bloodSugarLevel:data[0].index[2].level,
                bloodSugarIndex:data[0].index[2].desc,
                clothLevel:data[0].index[3].level,
                clothesIndex:data[0].index[3].desc,
                carWashLevel:data[0].index[4].level,
                carWashIndex:data[0].index[4].desc,
                recentlyWeaData:data.slice(1,5)
            })
        })

    }
    render(){
        const {weatherStore, navStore} = this.props;
        let title = weatherStore.weatherInfo.municipalName?weatherStore.weatherInfo.municipalName+"-"+weatherStore.weatherInfo.city:'';
        const navOption ={
            classtyle:"",
            navstyle:"bar-transparentwhite",
            title:title,
            color:'#fff',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
        }
        return (<View className={'container '+this.state.backgroundClass} >
                    <NavBar param={navOption}></NavBar>
                    <View className="wea-tem" style={`margin-top:${navStore.navHeight+navStore.statusHeight+10}px`}>
                        <text decode="{{true}}">{"&nbsp;"+weatherStore.weatherInfo.tem+"°"}</text>
                    </View>
                    <View className="wea-tem2"><text decode="{{true}}">{
                        weatherStore.weatherInfo.tem2+"°/"+weatherStore.weatherInfo.tem1+"°"
                        }</text>
                    </View>
                    <View className="wea-wea">
                        <View className="weather-icon" style={weatherStore.weatherInfo.wea_img?{backgroundImage:'url('+weatherIconUrl+weatherStore.weatherInfo.wea_img+'.png)'}:""}></View>
                    </View>
                    <View className="text-wea"><View>{weatherStore.weatherInfo.wea}</View></View>
                    <View className="wea-info">
                        <text decode="{{true}}">
                            {"空气质量:&nbsp;"+ weatherStore.weatherInfo.air_level
                                +"&nbsp;&nbsp;湿度:&nbsp;"+weatherStore.weatherInfo.humidity}
                        </text>
                       
                    </View>
                    <View className='at-row at-row--wrap nowWea-info'>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='kongqi' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">
                                            <View>空气质量</View>
                                            <View className="level-text">{this.state.air_level?this.state.air_level:''}</View>
                                        </View>
                                    </View>
                                </View>
                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        {this.state.air_tips?this.state.air_tips:''}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='feng' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">风力风向</View>
                                    </View>
                                </View>
                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        <View>{"风向:"+weatherStore.weatherInfo.win}</View>
                                        <View>风力:{this.state.win_speed?this.state.win_speed:''}</View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='qing' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">
                                            <View>紫外线指数</View>
                                            <View className="level-text">{this.state.raysLevel?this.state.raysLevel:''}</View>
                                        </View>
                                    </View>
                                </View>
                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        {this.state.raysIndex?this.state.raysIndex:''}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='iconxt' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">
                                            <View>血糖指数</View>
                                            <View className="level-text">{this.state.bloodSugarLevel?this.state.bloodSugarLevel:''}</View>
                                        </View>
                                    </View>
                                </View>
                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        {this.state.bloodSugarIndex?this.state.bloodSugarIndex:''}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='yifu' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">
                                            <View>穿衣指数</View>
                                            <View className="level-text">{this.state.clothLevel?this.state.clothLevel:''}</View>
                                        </View>
                                    </View>
                                </View>
                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        {this.state.clothesIndex?this.state.clothesIndex:''}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className='at-col at-col-4 selectIndex-body'>
                            <View className="at-row at-row--wrap selectIndex-body1">
                                <View className="at-row selectIndex-sub">
                                    <View className="at-col at-col-4 selectIndex-icon">
                                        <AtIcon prefixClass='icon' value='qiche' size='30' color='#187db6'></AtIcon>
                                    </View>
                                    <View className="at-col at-col-8">
                                        <View className="selectIndex-title">
                                            <View>洗车指数</View>
                                            <View className="level-text">{this.state.carWashLevel?this.state.carWashLevel:''}</View>
                                        </View>
                                    </View>
                                </View>

                                <View className="at-row selectIndex-foot">
                                    <View className="selectIndex-text">
                                        {this.state.carWashIndex?this.state.carWashIndex:''}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className='at-row at-row--wrap wea-recently'>
                        {
                            this.state.recentlyWeaData?
                            this.state.recentlyWeaData.map((item,index)=>{
                                return (<View className='at-col at-col-3 recently-body' key={'recent'+index}>
                                            <View style="height:100%" className={item.wea_img==='qing'||item.wea_img==='yun'?'fineDay-background':'overcast-background'}>
                                                <View className="recently-text">
                                                    {item.day}
                                                </View>
                                                <View className="recently-icon">
                                                    <AtIcon prefixClass='icon' value={item.wea_img} size='30' color='#ffffff'></AtIcon>
                                                </View>
                                                <View className="recently-text">
                                                    {item.wea}
                                                </View>
                                                <View className="recently-text">
                                                    {item.tem2+'/'+item.tem1}
                                                </View>
                                                <View className="recently-text">
                                                    {item.win[0]+'→'+item.win[1]}
                                                </View>
                                                <View className="recently-text">
                                                    {item.win_speed}
                                                </View>
                                            </View>
                                        </View>)
                            }):''
                        }
                    </View>
                    <View className="wea-foot">
                            <text decode="{{true}}">
                            {
                            "更新时间:&nbsp;"+weatherStore.weatherInfo.newUpdate
                            }
                            </text>
                        
                    </View>
                </View>)
    }
}
export default Weather