import { Component } from '@tarojs/taro'
import { View,Image,Text} from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import {otherImgUrl} from '../../../untils/untils'
import NavBar from '../../../components/NavBar'
import './help-page.scss'

@inject('navStore')
@observer
class Help extends Component{
    config = {
        navigationBarTitleText: '帮助',
        "navigationStyle": "custom"
      }
    state={
        question:["部分功能无法使用","建议和Bug反馈"],
        answer:[
            "1.确保已经是登录状态",
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.部分功能需要手机部分功能权限,授权权限",
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.重启小程序",
            "可以通过客服反馈进行留言或者发邮件至1915448000@qq.com进行反馈"
        ],
        imgUrl:[
            otherImgUrl+"help-1.png",
            otherImgUrl+"help-2.png",
        ]
    }
    render(){
        const { navStore } = this.props; 
        const navOption ={
            classtyle:"bar-personal",
            navstyle:"bar-transparentwhite",
            title:'帮助',
            color:'#fff',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
        }
        return (<View class='container'>
                    <NavBar param={navOption}></NavBar>
                    <View className='section' style={`margin-top:${navStore.navHeight+navStore.statusHeight+10}px`}>
                        <View className="question">Q：{this.state.question[0]}</View>
                        <View className="answer">A：{this.state.answer[0]}</View>
                        <View className="answer"><Text decode="{{true}}">{this.state.answer[1]}</Text></View>
                        <Image src={this.state.imgUrl[0]}/>
                        <Image src={this.state.imgUrl[1]}/>
                        <View className="answer"><Text decode="{{true}}">{this.state.answer[2]}</Text></View> 
                    </View>
                    <View className='section'>
                        <View className="question">Q：{this.state.question[1]}</View>

                        <View className="answer">A：{this.state.answer[3]}</View>
                        
                    </View>
                </View>)
    }
}
export default Help