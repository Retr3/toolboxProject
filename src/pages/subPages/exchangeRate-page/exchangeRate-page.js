import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Picker } from '@tarojs/components'
import { AtIcon, AtToast, AtInputNumber, AtNavBar } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'

import './exchangeRate-page.scss'

const currencyList ={
  "人民币":"1",
  "美元":"1316",
  "欧元":"1326",
  "英镑":"1314",
  "港币":"1315",
  "瑞士法郎":"1317",
  "德国马克":"1318",
  "法国法郎":"1319",
  "新加坡元":"1375",
  "瑞典克朗":"1320",
  "丹麦克朗":"1321",
  "挪威克朗":"1322",
  "日元":"1323",
  "加拿大元":"1324",
  "澳大利亚元":"1325",
  "澳门元":"1327",
  "菲律宾比索":"1328",
  "泰国铢":"1329",
  "新西兰元":"1330",
  "韩元":"1331",
  "卢布":"1843",
  "林吉特":"2890",
  "新台币":"2895",
  "西班牙比塞塔":"1329",
  "意大利里拉":"1371",
  "荷兰盾":"1372",
  "比利时法郎":"1373",
  "芬兰马克":"1374",
  "印尼卢比":"3030",
  "巴西里亚尔":"3253",
  "阿联酋迪拉姆":"3899",
  "印度卢比":"3900",
  "南非兰特":"3901",
  "沙特里亚尔":"4418",
  "土耳其里拉":"4560"
}
const selectorList =[
  "人民币","美元","欧元","英镑","港币","瑞士法郎","德国马克","法国法郎","新加坡元","瑞典克朗","丹麦克朗","挪威克朗",
  "日元","加拿大元","澳大利亚元","澳门元","菲律宾比索","泰国铢","新西兰元","韩元","卢布","林吉特","新台币",
  "西班牙比塞塔","意大利里拉","荷兰盾","比利时法郎","芬兰马克","印尼卢比","巴西里亚尔","阿联酋迪拉姆","印度卢比",
  "南非兰特","沙特里亚尔","土耳其里拉"]
const numReg = /^(([^0][0-9]+|0)\.([0-9]{1,4})$)|^(([^0][0-9]+|0)$)|^(([1-9]+)\.([0-9]{1,4})$)|^(([1-9]+)$)/;
@inject('navStore')
@observer
class exchangeRate extends Component{
    config = {
        navigationBarTitleText: '汇率',
        "enablePullDownRefresh": true,
        "navigationStyle": "custom"
      }
    state={
      pjname:'1316',
      name:'美元',
      buyingRate:'',//现汇买入价					
      buyingPrice:'',//现钞买入价
      sellingExchange:'',//现汇卖出价
      sellingPrice:'',//现钞卖出价
      bankPrice:'',//中行折算价
      time:'',//发布时间
      
      money:100,
      firstPjname:'',//输入货币编号
      secondPjname:'',//转换货币编号
      firstname:'',//输入货币名
      secondname:'',//要转换的货币名
      firstBrRate:1,//输入的货币现汇买入价比率
      secondBrRate:1,//要转换的货币买入价比率
      firstValue:0,//picker值
      secondValue:0,//picker值
      rateResult:'',//当前汇率比
      result:'',//结果
      nameIsNull:false,//货币为空
    }
    componentDidMount () {
      Taro.showLoading();
      this.getRate(this.state.pjname,0);
    }
    //下拉刷新初始化界面
    onPullDownRefresh() {
      this.setState({
        pjname:'1316',
        name:'美元',
        buyingRate:'',//现汇买入价					
        buyingPrice:'',//现钞买入价
        sellingExchange:'',//现汇卖出价
        sellingPrice:'',//现钞卖出价
        bankPrice:'',//中行折算价
        time:'',//发布时间
        money:100,
        firstPjname:'',//输入货币编号
        secondPjname:'',//转换货币编号
        firstname:'',//输入货币名
        secondname:'',//要转换的货币名
        firstBrRate:1,//输入的货币现汇买入价比率
        secondBrRate:1,//要转换的货币买入价比率
        firstValue:0,//picker值
        secondValue:0,//picker值
        rateResult:'',//当前汇率比
        result:'',//结果
        nameIsNull:false,//货币为空
        moneyError:false
      },()=>{
        Taro.showLoading();
        this.getRate(this.state.pjname,0);
      })
    }
    //获取外汇牌价
    getRate = (pjname,flag)=>{
      let that = this;
      let date = new Date();
      let nowDate = date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate();
      wx.cloud.callFunction({
        name:'getCurrencyRate',
        data:{
            pjname,
            nowDate
        },
        success:res=>{
              let rate = res.result;
              switch(flag){
                case 0:
                  that.setState({
                    buyingRate:rate.buyingRate,					
                    buyingPrice:rate.buyingPrice,
                    sellingExchange:rate.sellingExchange,
                    sellingPrice:rate.sellingPrice,
                    bankPrice:rate.bankPrice,
                    time:rate.time
                  },()=>{
                    Taro.hideLoading();
                  })
                  return 
                case 1:
                  that.setState({
                    firstBrRate:(parseFloat(rate.buyingRate)/100).toFixed(4)
                  },()=>{
                    if(that.state.secondPjname==="1"){
                      Taro.hideLoading();
                      that.rateComput();
                    }else{
                      that.getRate(that.state.secondPjname,2)
                    }
                  })
                  return
                case 2:
                  that.setState({
                    secondBrRate:(parseFloat(rate.buyingRate)/100).toFixed(4)
                  },()=>{
                    Taro.hideLoading();
                    that.rateComput();
                  })
                  return
                default : 
                    console.log("no");
                    Taro.hideLoading();
                  return
              }
            },
        fail: err => {
            // handle error
            Taro.hideLoading();
            console.log("读取云端函数失败"+err);
        }
      })
    }
    //计算汇率比率
    rateComput = () =>{
      let rateInfo = this.state;
      let rateResult = ((rateInfo.firstBrRate/rateInfo.secondBrRate).toFixed(4)*rateInfo.money).toFixed(4);
      let result = `${this.state.money} ${this.state.firstname} = ${rateResult} ${this.state.secondname}`;
      this.setState({
        rateResult,
        result
      })
    }
    //货币交换
    rateExChange = () =>{
      let firstname = this.state.firstname;
      let firstPjname = this.state.firstPjname;
      let firstBrRate = this.state.firstBrRate;
      let secondname = this.state.secondname;
      let secondPjname = this.state.secondPjname;
      let secondBrRate = this.state.secondBrRate;
      let firstValue = this.state.firstValue;
      let secondValue = this.state.secondValue;
      [firstname,secondname] = [secondname,firstname];
      [firstPjname,secondPjname] = [secondPjname,firstPjname];
      [firstBrRate,secondBrRate] = [secondBrRate,firstBrRate];
      [firstValue,secondValue] = [secondValue,firstValue];
      this.setState({
        firstname,
        firstPjname,
        firstBrRate,
        firstValue,
        secondname,
        secondPjname,
        secondBrRate,
        secondValue
      },()=>{
        console.log(this.state);
      })
    }
    //转换
    toRateComput = ()=>{
      let firstPjname = this.state.firstPjname;
      let secondPjname = this.state.secondPjname;
      let regNum=new RegExp(numReg,'g');
      let rsNum=regNum.exec(this.state.money);
      if(firstPjname && secondPjname && rsNum){
        Taro.showLoading({title:'努力查询中...'})
        if(firstPjname === secondPjname){
          this.setState({
            firstBrRate:1,
            secondBrRate:1
          },()=>{
            Taro.hideLoading();
            this.rateComput();
          })
        }else if(secondPjname=="1"){
          this.setState({
            secondBrRate:1
          },()=>{
            this.getRate(firstPjname,1)
          })
        }else if(firstPjname==="1"){
          this.setState({
            firstBrRate:1
          },()=>{
            this.getRate(secondPjname,2)
          })
        }else{
          this.getRate(firstPjname,1)
        }
      }else{
        if(rsNum){
          this.setState({
            nameIsNull:true
          })
        }else{
          this.setState({
            moneyError:true
          })
        }
        
      }
    }
    //输入框
    inputChange = e=>{
      this.setState({
        money:e
      })
    }
    //选择
    onSelectChange = e =>{
      let name = selectorList[parseInt(e.detail.value)+1];
      console.log(parseInt(e.detail.value)+1);
      this.setState({
        pjname: currencyList[name],
        name
      },()=>{
        Taro.showLoading({title:'努力查询中...'})
        this.getRate(this.state.pjname,0);
      })
    }
    //汇率计算第一种货币选择
    onFirstSelectChange = e =>{
      let firstname = selectorList[e.detail.value];
      this.setState({
        firstValue:e.detail.value,
        firstPjname: currencyList[firstname],
        firstname
      })
    }
    //汇率计算第二种货币选择
    onSecondSelectChange = e =>{
      let secondname = selectorList[e.detail.value];
      this.setState({
        secondValue:e.detail.value,
        secondPjname: currencyList[secondname],
        secondname
      })
    }
    //toast关闭事件
    onNameClose = () =>{
      this.setState({
        nameIsNull:false
      })
    }
    onMoneyClose = () =>{
      this.setState({
        moneyError:false
      })
    }
    goBackPre=()=>{
      Taro.navigateBack();
    }
    render(){
      const { navStore } = this.props;
        return (<View class='container'>
                  <View className="bar-basecolor"  style={`height:${navStore.statusHeight}px;width:100%`}></View>
                  <View  style={`height:${navStore.navHeight}px`}>
                      <AtNavBar
                          className="bar-basecolor"
                          onClickLeftIcon={this.goBackPre}
                          color='#fff'
                          title='汇率'
                          leftText=''
                          leftIconType='chevron-left'
                      />
                  </View>
                  <View className='section'>
                    <View className="ratecomput-title"><AtIcon prefixClass='icon' value='exchange-rate2' size='20' color='#6190e8'></AtIcon> 汇率计算器</View>
                    <View className="rate-info">
                      <View className="ratecomput-input">
                        <View className="at-col4">持有金额：</View>
                        <View className="at-col6">
                          <AtInputNumber
                            min={1}
                            max={100000000}
                            step={1}
                            width={200}
                            value={this.state.money}
                            onChange={this.inputChange.bind(this)}
                          />
                        </View>
                      </View>
                      <View className="picker-view">
                        <Picker mode='selector' value={this.state.firstValue} range={selectorList} onChange={this.onFirstSelectChange}>
                          <View className='picker'>
                          <View>持有货币:</View>
                            <View className="picker-gray">{this.state.firstname}</View>
                          </View>
                        </Picker>
                      </View>

                      <View className="ratecomput-btn-view">
                        <Button className="ratecomput-btn btn-change" onClick={this.rateExChange}>
                          <AtIcon prefixClass='icon' value='change' size='20' color='#6190e8'></AtIcon>
                        </Button>
                      </View>

                      <View className="picker-view">
                        <Picker mode='selector' value={this.state.secondValue} range={selectorList} onChange={this.onSecondSelectChange}>
                          <View className='picker'>
                          <View>兑换货币:</View>
                            <View className="picker-gray">{this.state.secondname}</View>
                          </View>
                        </Picker>
                      </View>

                      <View className="ratecomput-btn-view">
                        <Button className="ratecomput-btn btn-submit" onClick={this.toRateComput}>
                          转换
                        </Button>
                      </View>
                      
                      <View className="result-view">{this.state.result?this.state.result:''}</View>
                    </View>
                    
                  

                  </View>
                  
                  <View className='section'> 
                    <View className="rate-title"><AtIcon prefixClass='icon' value='exchange-rate1' size='20' color='#a71e32'></AtIcon> 外汇牌价</View>	
                    <View className="rate-info">
                        <View className="picker-view pick-noborder">
                          <Picker mode='selector' range={selectorList.slice(1,selectorList.length-1)} onChange={this.onSelectChange}>
                            <View className='picker'>
                              <View>当前选择货币:</View>
                              <View className="picker-gray">{this.state.name}</View>
                            </View>
                          </Picker>
                        </View>
                        <View className="item">现汇买入价：<Text className="rate-red">{this.state.buyingRate}</Text></View>
                        <View className="item">现钞买入价：<Text className="rate-blue">{this.state.buyingPrice}</Text></View>
                        <View className="item">现汇卖出价：<Text className="rate-blue">{this.state.sellingExchange}</Text></View>
                        <View className="item">现钞卖出价：<Text className="rate-blue">{this.state.sellingPrice}</Text></View>
                        <View className="item">中行折算价：<Text className="rate-blue">{this.state.bankPrice}</Text></View>
                        <View><Text decode="{{true}}" className="tips">*&nbsp;银行数据更新时可能会出现获取不到数据的情况，请等待一会后重新下拉刷新</Text></View>
                    </View>
                  </View>
                  <View className='section'>
                    <Text>数据仅供参考，交易时以银行柜台成交价为准\n更新时间:{this.state.time}</Text>
                  </View>
                  <AtToast isOpened={this.state.nameIsNull} onClose={this.onNameClose} duration={1100} text="货币不能为空哦"></AtToast>
                  <AtToast isOpened={this.state.moneyError} onClose={this.onMoneyClose} duration={1100} text="请输入正确的金额"></AtToast>

                </View>)
    }
}
export default exchangeRate