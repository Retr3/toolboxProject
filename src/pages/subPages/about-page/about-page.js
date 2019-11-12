import { Component } from '@tarojs/taro'
import { View, Image} from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import {otherImgUrl} from '../../../untils/untils'
import NavBar from '../../../components/NavBar'
import './about-page.scss'

@inject('navStore')
@observer
class About extends Component{
    config = {
        navigationBarTitleText: '关于',
        "navigationStyle": "custom"
      }
    state={
        myInfo:[
            {
                label:'姓名',
                value:'张效瑜'
            },{
                label:'职业',
                value:'前端工程师'
            },{
                label:'微信',
                value:'zxy1915448000'
            },{
                label: '邮箱',
                value: '1915448000@qq.com'
            },{
                label: 'github',
                value: 'https://github.com/Retr3'
              }
        ]
    }
    render(){
        const { navStore } = this.props; 
        const navOption ={
            classtyle:"bar-personal",
            navstyle:"bar-transparentwhite",
            title:'关于',
            color:'#fff',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
        }
        return (<View className='container'>
                    <NavBar param={navOption}></NavBar>
                    <View className='banner' style={`margin-top:${navStore.navHeight+navStore.statusHeight+10}px`}>
                        <Image src={otherImgUrl+"about-bg7.jpg"} />
                    </View>
                    <View className='section'>
                        {this.state.myInfo.map((item,index)=>{
                            return <View key={item+index}>
                                <text>{item.label}：</text>
                                <text>{item.value}</text>
                            </View>
                        })}
                    </View>

                    <View className='section'>
                        <text>  基于Taro的小程序系统，数据来源于网络，仅供学习和参考。源码在github上开源，觉得不错的可以给个star鼓励下(〃'▽'〃)</text>
                    </View>
                </View>)
    }
}
export default About