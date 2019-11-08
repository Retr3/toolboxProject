import { Component } from '@tarojs/taro'
import { View,Image,Text} from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './help-page.scss'
class Help extends Component{
    config = {
        navigationBarTitleText: '帮助'
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
            "https://7a78-zxytest-37pbw-1259522293.tcb.qcloud.la/other_img/help-1.png",
            "https://7a78-zxytest-37pbw-1259522293.tcb.qcloud.la/other_img/help-2.png"
        ]
    }
    render(){
        return (<View class='container'>
                   
                    <View className='section'>
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