import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtRadio , AtButton, AtInput,AtToast} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

import './poem-page.scss'
@inject('poemStore')
@observer
class Poem extends Component{
    config = {
        navigationBarTitleText: '作首诗',
        "navigationBarBackgroundColor": "#EE7000"
      }
    state={
        poemTypeOpt:[
            { label: '五言', value: '5' },
            { label: '七言', value: '7' }
        ],
        wordOffsetOpt:[
            { label: '藏头', value: '1' },
            { label: '藏尾', value: '2' },
            { label: '藏中', value: '3' },
            { label: '递增', value: '4' },
            { label: '递减', value: '5' }
        ],
        yayunOpt:[
            { label: '双句一压', value: '1' },
            { label: '双句押韵', value: '2' },
            { label: '一三四押', value: '3' }
        ],
        poemType:'5',
        offset:'1',
        yayun:'1',
        poemWaitFlag:false,//按钮禁用状态
        waitTime:6,//作诗等待事件
        text:'',
        errorToast:false,
        inputIsNull:false//输入为空
    }
    getPoemInfo = ()=>{
        if(this.state.text){
            const { poemStore } = this.props;
            let poemInfo = {
                poemType:this.state.poemType,
                offset:this.state.offset,
                yayun:this.state.yayun,
                text:this.state.text
            }
            poemStore.changePoemInfo(poemInfo);
            this.setState({
                poemWaitFlag:true
            },()=>{
                this.waitFn();
                Taro.navigateTo({
                    url: './poem-detail',
                    fail:function(err){
                        console.log(err);
                        that.setState({
                            errorToast:true
                        })
                    }
                })
            })
        }else{
            this.setState({
                inputIsNull:true
            })
        }
    }
    //后台接口等待3秒,前台等待5秒
    waitFn = ()=>{
        let waitTime = this.state.waitTime;
        this.setState({
            waitTime:waitTime-1
        },()=>{
            setTimeout(()=>{
                if(this.state.waitTime>1){
                    this.waitFn();
                }else{
                    this.setState({
                        poemWaitFlag:false,
                        waitTime:6
                    })
                }
            },1000) 
        })
    }
    //input
    textHandleChange = text =>{
        let regText=text.replace(/[^\u4e00-\u9fa5]/g,'')
        this.setState({
            text:regText
        })
        return regText;
    }
    //点击事件
    typeHandleChange = poemType =>{
        this.setState({
            poemType
        })
    }
    offsetHandleChange = offset =>{
        this.setState({
            offset
        })
    }
    yayunHandleChange = yayun =>{
        this.setState({
            yayun
        })
    }
    //close action
    ontoastClose = () =>{
        this.setState({
            errorToast:false
        })
    }
    onNullClose = () =>{
        this.setState({
            inputIsNull:false
        })
    }
    render(){
        return (<View className='container'>
                    <View>
                        <AtInput
                            name='value'
                            title='内容:'
                            className="input-style"
                            type='text'
                            placeholder='请填入内容(最多八个字)'
                            maxLength={8}
                            value={this.state.text}
                            onChange={this.textHandleChange}
                        />
                    </View>
                    <View class="section">
                        <View className="poem-title at-icon at-icon-tag"><Text decode="{{true}}">&nbsp;&nbsp;字数</Text></View>
                        <AtRadio
                            options={this.state.poemTypeOpt}
                            value={this.state.poemType}
                            onClick={this.typeHandleChange.bind(this)}
                        />
                    </View>
                   <View class="section">
                   <View className="poem-title at-icon at-icon-tag"><Text decode="{{true}}">&nbsp;&nbsp;类型</Text></View>
                        <AtRadio
                            options={this.state.wordOffsetOpt}
                            value={this.state.offset}
                            onClick={this.offsetHandleChange.bind(this)}
                        />
                   </View>
                    <View class="section">
                    <View className="poem-title at-icon at-icon-tag"><Text decode="{{true}}">&nbsp;&nbsp;押韵方式</Text></View>
                        <AtRadio
                            options={this.state.yayunOpt}
                            value={this.state.yayun}
                            onClick={this.yayunHandleChange.bind(this)}
                        />

                    </View>
                    <View class="section">
                        <AtButton className="btn-submit" disabled={this.state.poemWaitFlag} onClick={this.getPoemInfo}>{this.state.poemWaitFlag?`${this.state.waitTime}秒后作诗`:"开始作诗"}</AtButton>
                    </View>
                    <AtToast isOpened={this.state.errorToast}
                            onClose ={this.ontoastClose}
                            duration={1000}
                            text="出错了" 
                            icon="close" >
                    </AtToast>
                    <AtToast isOpened={this.state.inputIsNull}
                            onClose ={this.onNullClose}
                            duration={1100}
                            text="内容不能为空哦">
                    </AtToast>
                    
                </View>)
    }
}
export default Poem