import Taro from '@tarojs/taro'

let getNavHeight = () =>{
    let sysInfo = Taro.getSystemInfoSync();
    let navheight;
    let statusHeight = sysInfo.statusBarHeight;
    sysInfo.system.indexOf('iOS') > -1?navheight = 44:navheight = 48
    return {statusHeight,navheight};
}

export {getNavHeight}
   
