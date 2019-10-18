import { observable } from 'mobx'
let d=new Date()
const wallpaperStore = observable({
  wallpaperUrl: "",
  wallpaperMsg: "",
  nowDate: d.getFullYear()+""+(d.getMonth()+1)+""+d.getDate(),
  changeurl(newurl){
    this.wallpaperUrl = newurl;
  },
  changemsg(newmsg){
    this.wallpaperMsg = newmsg;
  }
})
export default wallpaperStore