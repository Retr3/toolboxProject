import { Component } from '@tarojs/taro'
import { View, Image} from '@tarojs/components'
import { AtNavBar } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

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
    goBackPre=()=>{
        Taro.navigateBack();
    }
    render(){
        const { navStore } = this.props; 
        return (<View className='container'>
                    <View className="bar-personal" style={'width:100vw'}>
                        <View className="bar-transparent"  style={`height:${navStore.statusHeight}px;width:100%`}></View>
                        <View  style={`height:${navStore.navHeight}px`}>
                            <AtNavBar
                                className="bar-transparent"
                                onClickLeftIcon={this.goBackPre}
                                color='#fff'
                                title='关于'
                                leftText=''
                                leftIconType='chevron-left'
                            />
                        </View>
                    </View>
                    
                    <View className='banner'>
                        <Image src="https://7a78-zxytest-37pbw-1259522293.tcb.qcloud.la/other_img/about-bg7.jpg" />
                    </View>
                    <View className='section'>
                        {this.state.myInfo.map(item=>{
                            return <View>
                                <text>{item.label}：</text>
                                <text>{item.value}</text>
                            </View>
                        })}
                    </View>

                    <View className='section'>
                        <text>  基于Taro的小程序系统，仅供学习和参考。源码在github上开源，觉得不错的可以给个star鼓励下(*^▽^*)</text>
                    </View>
                </View>)
    }
}
export default About