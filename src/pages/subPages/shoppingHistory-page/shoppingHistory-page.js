import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtCurtain, AtSearchBar,AtToast, AtModal,AtModalHeader,AtModalContent,AtModalAction, AtButton} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import Chart from 'taro-echarts'
import NavBar from '../../../components/NavBar'

import './shoppingHistory-page.scss'
//电商地址列表头
const onlineRetailerList = [
    'https://m.tb.cn',
    'https://item.m.jd.com',
    'https://detail.tmall.com',
    'https://item.taobao.com/',
    'https://re.jd.com',
    'https://item.jd.com',
    'https://mobile.yangkeduo.com/'
]

@inject('navStore')
@observer
class History extends Component{
    config = {
        navigationBarTitleText: '商品历史价格查询',
        "navigationStyle": "custom"
      }
      state={
          goodsLink:'',
          clipboardLink:'',
          hasGoodsInfo:false,
          alertNoGoods:false,
          minPrice:0,
          minDate:0,
          nowPrice:0,
          spName:'',
          spPic:'',
          chartsData:'',
          //信息查询中loading
          msgLoad:true,
          //option中的方法
          minMonth:2,//最少展示2个月的信息
          xBlockNum:6,//x轴被分割几块
          inputIsNull:false,//输入校验提示
          copyModel:false,//剪贴板检测模态框
          errorAlert:false
      }
    componentDidMount () {

    }
    componentDidShow () {
        let that = this;
        Taro.getClipboardData({
            success (res){
              let copyInfo = res.data;
              let copyFlag = onlineRetailerList.findIndex(item=>{
                return copyInfo.indexOf(item)>-1
              })
              if(copyFlag>-1){
                    that.setState({
                        copyModel:true,
                        clipboardLink:copyInfo
                    })
              }
            }
          })
    }
    //获取input value
    handelChange=value=>{
        this.setState({
            goodsLink:value
        })
    }
    msgLoadFn = ()=>{
        let that = this;
        if(this.state.goodsLink){
            this.setState({
                msgLoad:false,
                hasGoodsInfo:false
            },()=>{
                that.searchHistory();
            })
        }else{
            this.setState({
                inputIsNull:true
            })
        }
    }
    //剪贴板跳转商品
    clipboardShop=()=>{
        this.setState({
            copyModel:false,
            goodsLink:this.state.clipboardLink
        },()=>{
            this.msgLoadFn();
        })
    }
    //查询云函数获取数据
    searchHistory=()=>{
        let link = this.state.goodsLink;
        let that = this;
        wx.cloud.callFunction({
            name:'getGoodsHistory',
            data:{
                goodsLink:link
            },
            success:res=>{
                let goodsInfo = JSON.parse(res.result);
                if(goodsInfo && goodsInfo.ok === 1){
                    this.setState({
                        hasGoodsInfo:true,
                        minPrice:goodsInfo.zdprice,
                        minDate:goodsInfo.zdtime,
                        nowPrice:goodsInfo.spprice,
                        spName:goodsInfo.spname,
                        chartsData:goodsInfo.jsData,
                        spPic:goodsInfo.sppic
                    });
                }else{
                    this.setState({
                        alertNoGoods:true
                    })
                }
                
            },
            fail: err => {
                // handle error
                this.setState({
                    errorAlert:true
                })
                console.log(err);
            },
            complete: () => {
                that.setState({
                    goodsLink:"",
                    msgLoad:true
                })
            }

        })
    }

    //图表数据处理排序
    chartsInfo = (chartsInfo)=>{
        let newchartsData = JSON.parse("["+chartsInfo+"]");
        //日期排序方法（其实数据已经是有序的）
        for (var i = 1; i < newchartsData.length; i++) {
                var key = newchartsData[i][0];
                var j = i - 1;
                while (j >= 0 && newchartsData[j][0] > key) {
                    newchartsData[j + 1] = newchartsData[j];
                    j--;
                }
                newchartsData[j + 1][0] = key;
        }
        return newchartsData;
    }
    //图表数据
    showChart = ()=>{ 
        let that = this;
        let data= [];
        let chartsInfo = this.chartsInfo(this.state.chartsData);
        let currentDay = new Date().setHours(0, 0, 0, 0);
        let currentDayDate = new Date(currentDay).getTime();
         //计算x轴与y轴的分割
        var xInterval, yInterval, yMin, yMax, xMin, xMax, maxValue, minValue, maxDate, minDate, addDate;
        addDate = this.state.minMonth * 30 * 24 * 60 * 60 * 1000; //日期不足4个月，补到120天
        var  arrX = [], arrY = [];

        for (var i = 0; i < chartsInfo.length; i++) {
             if (chartsInfo[i][1] <= 0) continue;
             arrX.push(chartsInfo[i][0]);
             arrY.push(chartsInfo[i][1]);
             data.push([chartsInfo[i][0], chartsInfo[i][1], chartsInfo[i][2]]);
        }
        //当前时间没有价格时,用前一天补上
        if (data.length > 0 && data[data.length - 1][0] < currentDayDate) {
            data.push([currentDayDate, data[data.length - 1][1],""]);
        }
        maxValue = Math.max.apply(null, arrY); //y轴最大值
        minValue = Math.min.apply(null, arrY); //y轴最小值
        maxDate = new Date(data[data.length - 1][0]).getTime(); //最大日期
        minDate = new Date(data[0][0]).getTime(); //最小日期
     
        yMin = minValue - ((minValue + maxValue) / 2 - minValue); //y轴开始最小值
        yMin = yMin >= 0 ? yMin : 0;
        yMax = maxValue + (maxValue - minValue) / 4;
        if (yMax === yMin) {
            yMin = yMin - yMin / 2;
            yMax = yMax + yMax / 2;
        }
        if (maxDate - minDate > addDate) {
            xMin = minDate;
        } else {
            xMin = maxDate-addDate; //保证最小4个月
        }
        xMax = maxDate;

        // //计算右侧宽度
        // if (minValue.toString().length > maxValue.toString().length) {
        //     $("body").append("<span class='heightestPrice' style='font-size:12px; display:none;'>"+(minValue+15).toString()+"</span>")
 
        // } else {
        //     $("body").append("<span class='heightestPrice'  style='font-size:12px; display:none;'>"+(maxValue+15).toString()+"</span>")
             
        // }

        // var labelWidth = $('.heightestPrice').width() + 15;
        // var labelHeight = $('.heightestPrice').height() + 10;
 

        //x轴显示的间隔
        xInterval = (xMax - xMin) / this.state.xBlockNum;
        //y轴显示的间隔
        yInterval = (yMax - yMin) / this.state.xBlockNum;
        let windowsWidth = Taro.getSystemInfoSync().windowWidth;
        let option = {
            animation: false,
            tooltip: {
                trigger: 'axis',
                //transitionDuration: 0,
                // confine: true,
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#3c763d'
                    }
                },
                padding: 5,
                borderWidth: 1,
                backgroundColor:'#3c763d',
                borderColor: '#3c763d',
                position: function (point, params, dom) {
                    let pos = "";
                    point[0] > (windowsWidth/2)?pos = (point[0]-windowsWidth/2) :pos = point[0];
                    return [pos+20, 0];
                },
                formatter: function (obj) {
                    if (obj.length > 0) {
                        let [year,mouth,day] = that.getBJTime(obj[0].data[0]);
                        let time = year + '年' + mouth + '月' + day + '日';
                        let price = obj[0].data[1];
                        let youhui = obj[0].data[2];
                        let htmlType = 'div';
                        if (process.env.TARO_ENV === 'weapp') {
                            // 微信小程序端执行逻辑
                            htmlType = 'view';
                        }
                        let retHTML = `日期:${time}\n价格:${price}`;
                        if (youhui.length > 0) {
                            youhui = youhui.replace(",","\n");
                            youhui = youhui.replace("满减","\n满减");
                            youhui = youhui.replace("优惠券","\n优惠券");
                            retHTML = `日期:${time}\n价格:${price}\n优惠:${youhui}`;
                        }
                        let curDate = new Date();
                        let vDate = new Date(obj[0].data[0]);
                        if (obj[0].dataIndex === 0 && vDate > new Date(curDate.getTime() - 24 * 60 * 60 * 1000 * 25 * 30)) {
                            if (youhui.length > 0) {
                                youhui = youhui.replace(",",",\n");
                                youhui = youhui.replace("，","，\n");
                                retHTML = `第一次收录时间:${time},价格是${price}\n优惠:${youhui}`;
                            }
                            else {
                                retHTML = `第一次收录时间:${time},价格是${price}`;
                            }
                        }
                        return retHTML;
                    }
                }
            },
            grid: {
                left: '15%',
                right: '15%',
                bottom: '15%',
                top: 20,
                containLabel: false
            },
            xAxis: {
                type: 'time',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#dddddd'
                    }
                },
                interval: xInterval,
                boundaryGap: false,
                align: 'right',
                axisLabel: {
                    align: 'right',
                    rotate: 0,
                    color: '#555555',
                    showMinLabel: true,
                    showMaxLabel: true,
                    formatter: function (value, index) {
                        var date = new Date(value);
                        if (index === 0) {
                            return '';
                        } 
                        return `${(date.getMonth() + 1)}-${date.getDate()}`;
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#ddd'],
                        type: 'solid',
                        opacity: .8
                    }
                },
                min: function (value) {
                    return xMin;
                },
                max: function (value) {
                    return xMax;
                }
            },
            yAxis: {
                type: 'value',
                axisTick: {
                    show: false
                },
                interval: yInterval,
                boundaryGap: false,
                scale: true,
                axisLabel: {
                    show: true,
                    inside: false,
                    showMinLabel: true,
                    showMaxLabel: true,
                    color: '#555',
                    formatter: function (value, index) {
                        if (index === 0) {
                        } else {
                            return value.toFixed(0);
                        }
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#dddddd'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#ddd'],
                        type: 'solid',
                        opacity: .8
                    }
                },
                //最小刻度
                min: function (value) {
                    return yMin;
                },
                max: function (value) {
                    return yMax;
                }
            },
            series: [{
                name: '价格',
                type: 'line',
                symbol: 'circle',
                symbolSize: [2, 2],
                showSymbol: false,
                itemStyle: {
                    color: '#3c763d'
                },
                lineStyle: {
                    width: 2,
                    z: 22
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    data: [{
                        type: 'max',
                        symbol: 'none',
                        lineStyle: {
                            color: '#888888',
                            type: 'dotted',
                            width: 0.8
                        },
                        label: {
                            position: 'end',
                            formatter: '{c}',
                            color: '#555555'
                        }
                    }, {
                        type: 'min',
                        symbol: 'none',
                        lineStyle: {
                            color: '#888888',
                            type: 'dotted',
                            width: 0.8
                        },
                        label: {
                            position: 'end',
                            formatter: '{c}',
                            color: '#555555'
                        }
                    }],
                    label: {
                        show: true,
                        position: 'left'
                    }
                },
                data: data
            }],
        };
        //将空白未收录的时间线用默认的虚线画出来
        if (maxDate - minDate < addDate) {
        var lineDash = [{
            coord: [xMin, arrY[0]],
            lineStyle: {
                width: 1.3
            }
        }, {
            coord: [arrX[0], arrY[0]]
        }];
        option.series[0].markLine.data.push(lineDash)
        
        }
        return option;
    }

    
    //将时间拆分
    getBJTime =(time)=> {
        var year = new Date(parseInt(time)).getFullYear();
        var mouth = new Date(parseInt(time)).getMonth() + 1;
        var day = new Date(parseInt(time)).getDate();
        return [year,mouth,day];
    }
    noGoodsAlertConfirm = ()=>{
        this.setState({
            alertNoGoods:false
        })
    }
    //关闭动作
    inputNull = ()=>{
        this.setState({
            inputIsNull:false
        })
    }
    errorToast = ()=>{
        this.setState({
            errorAlert:false
        })
    }
    onClipboardClose=()=>{
        this.setState({
            copyModel:false,
            goodsLink:''
        })
    }
    render(){
        const { navStore } = this.props;
        const navOption ={
            classtyle:"bar-basecolor",
            title:'商品历史价',
            color:'#333',
            statusHeight:navStore.statusHeight,
            navHeight:navStore.navHeight
          }
        return (<View className="container">
                    <NavBar param={navOption}></NavBar>
                    <View className="search-body" style={`margin-top:${navStore.navHeight+navStore.statusHeight}px`}>
                        <AtSearchBar
                            name='goodsLinkName'
                            title=''
                            placeholder='请输入或复制商品链接'
                            value={this.state.goodsLink}
                            onChange={this.handelChange.bind(this)}
                            onActionClick={this.msgLoadFn.bind(this)}
                            maxLength={300}
                        />
                    </View>
                        
                        {
                            this.state.hasGoodsInfo? 
                            <View>
                                <View className="text-body">
                                    <View className="goods-title">{this.state.spName}</View>
                                    <View className="img-view">
                                        <Image className="goodsImg" src={this.state.spPic} />
                                    </View>

                                    <View className="price-info">
                                        <View className="item">商品历史最低价:￥<Text className="price-red">{this.state.minPrice}</Text></View>
                                        <View className="item">商品最低价日期:<Text className="price-blue">{this.state.minDate}</Text></View>
                                        <View className="item now-price">
                                            <View>当前商品价格:￥<Text className="price-red">{this.state.nowPrice}</Text></View>
                                            <View className="price-gray">{this.state.nowPrice>this.state.minPrice?"不是最低价":"是最低价"}</View>
                                        </View>
                                    </View>
                                </View>
                                <View className="chart-body">
                                    <View className="charts-title">商品历史价格趋势图</View>
                                   
                                    <View>
                                    <Chart height="500rpx"
                                        option={this.showChart()} 
                                        />
                                    </View>
                                </View>
                            </View>    
                            : 
                            <View className="noGoodsMsg">
                                <View className="msg">
                                    {this.state.msgLoad?
                                    <View className="list-noGoodsMsg">
                                        <View className="at-icon at-icon-shopping-bag no-icon"></View>
                                        <View className="no-text">支持京东、天猫、淘宝、亚马逊、苏宁、拼多多、小米商城、国美、考拉、网易严选等商品网址</View>
                                    </View>:
                                    <View className="list-noGoodsMsg">
                                        <View className="at-icon at-icon-loading-3 icon-loading"></View>
                                        <View className="loading-title">精彩马上呈现</View>
                                    </View>}
                                </View>
                            </View>        
                        }
                      

                        <AtModal isOpened={this.state.alertNoGoods} closeOnClickOverlay={true}>
                            <AtModalHeader>没有找到商品</AtModalHeader>
                            <AtModalContent className="modal-style">
                                <View>啊哦,该商品暂时没有收录哦</View>
                            </AtModalContent>
                            <AtModalAction> 
                                <Button onClick={this.noGoodsAlertConfirm}>确认</Button> 
                            </AtModalAction>
                        </AtModal>
                        <AtCurtain
                            closeBtnPosition="top"
                            isOpened={this.state.copyModel}
                            onClose={this.onClipboardClose}
                        >
                            <View className="clipboard-curtain">
                                <View className="at-icon at-icon-search clipboard-icon"></View>
                                <View className="clipboard-text">剪贴板可能存在商品链接，是否该查询商品</View>
                                <View className="clipboard-view">
                                    <AtButton className="clipboard-btn" circle={true} type="primary" onClick={this.clipboardShop}>去看看</AtButton>
                                </View>
                            </View>
                        </AtCurtain>
                        
                        <AtToast isOpened={this.state.inputIsNull} text="输入不能为空哦" icon="alert-circle" onClose={this.inputNull} duration={800}></AtToast>
                        <AtToast isOpened={this.state.errorAlert} text="啊哦，好像出错了" icon="alert-circle" onClose={this.errorToast} duration={1100}></AtToast>
                        
                </View>)
    }
}
export default History