import {weatherApiId,weatherApiSecrt} from './untils';

// let timerHour = TimerTask.getHours();
// let timerMinute = TimerTask.getMinutes();
const unknows = weatherApiId;
const db = wx.cloud.database();
const secrt = weatherApiSecrt;
function getData(cityid,flag){
    return new Promise((resolve, reject)=>{
        wx.request({
            url: `https://www.tianqiapi.com/api/`,
            data: {
                version: 'v6',
                cityid: cityid,
                appid:unknows,
                appsecret:secrt
            },
            success:res=>{
                res.data.isAdd = flag;
                console.log(res);
                resolve(res.data);
            },
            fail:err=>{
                reject(err);
            }
        })
    }
        //resolve
    )
}

function weatherApi(cityid,cityflag){

    //let lastCity = wx.getStorageSync('cityid');
    let lastUpdate = wx.getStorageSync('updatetime');
    if(cityflag==='new'){
        console.log("数据库第一次录入该地点");
        return getData(cityid,'1')
    }
    
    let nextUpdate = new Date(lastUpdate).getTime()+1000*60*60*3;
    let nowDate = new Date().getTime();
    if(nowDate<nextUpdate){
        console.log("读库");
        //读库
        return db.collection('live_weather').where({
            cityid: cityid}).get()
    }else{
        console.log("更新");
        //更新
        return getData(cityid,'2')
    }
}   

function divSevenDays(cityid){
    
    return new Promise((resolve, reject)=>{
        wx.request({
            url: `https://www.tianqiapi.com/api/`,
            data: {
                version: 'v1',
                cityid: cityid,
                appid:unknows,
                appsecret:secrt
            },
            success:res=>{
                console.log(res);
                resolve(res.data);
            },
            fail:err=>{
                reject(err);
            }
        })
    }
        //resolve
    )
}
export  {weatherApi,divSevenDays}