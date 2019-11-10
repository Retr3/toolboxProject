import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtNavBar} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import './poem-detail.scss'

@inject('poemStore')
@inject('navStore')
@observer
class PoemDetail extends Component{
    config = {
        navigationBarTitleText: '结果',
        "navigationStyle": "custom"
    }
    state={
        result:''
    }
    componentDidMount () { 
        const { poemStore } = this.props;
        wx.cloud.callFunction({
            name:'cangtoushi',
            data:poemStore.poemInfo,
            success:res=>{
                this.setState({
                    result:res.result
                })
            },
            fail:err=>{
                console.log(err);
            }
        })
    }
    copyPoem = data =>{
        Taro.setClipboardData({
            data,
            success (res) {
                Taro.getClipboardData({
                success (res) {
                  console.log(res.data) // data
                }
              })
            }
          })
    }
    goBackPre=()=>{
        Taro.navigateBack();
    }
    render(){
        const { poemStore, navStore } = this.props; 
        const limitList = poemStore.poemInfo.text.split("");
        const SymbolList = ["，","。"];
        return (<View className='container'>
                    <View className="bar-basecolor"  style={`height:${navStore.statusHeight}px;width:100%`}></View>
                    <View  style={`height:${navStore.navHeight}px`}>
                        <AtNavBar
                            className="bar-basecolor"
                            onClickLeftIcon={this.goBackPre}
                            color='#fff'
                            title='作首诗'
                            leftText=''
                            leftIconType='chevron-left'
                        />
                    </View>
                {this.state.result?
                    this.state.result.map((item,index)=>{
                        let itemList = item.split("");
                        return <View className="section" key={"poem"+index}>
                                <View className="section-body">
                                    {itemList.map((texts,i)=>
                                        limitList.indexOf(texts)>-1?
                                            <Text className="text-goal" key={index+texts+i}>{texts}</Text>:
                                        (SymbolList.indexOf(texts)>-1?
                                            <Text key={index+texts+i}>{texts}\n</Text>:
                                            <Text key={index+texts+i}>{texts}</Text>)
                                    )}
                                </View>
                                <View className="section-footer">
                                    <Button className="copy-btn" onClick={()=>{this.copyPoem(item)}}>复制</Button>
                                </View>
                        </View>
                    })    
                :<View class="poem-loading-view">
                    <View className="poem-loading">
                        <View className="at-icon at-icon-loading-3 icon-loading"></View>
                        <View>诗词加载中</View>
                    </View>
                </View>}
        </View>)
    }
}
export default PoemDetail