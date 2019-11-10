import { observable } from 'mobx'

const navStore = observable({
    navHeight: "",
    statusHeight:"",
    setNavHeight(height){
      this.navHeight = height;
    },
    setStatusHeight(height){
      this.statusHeight = height;
    }
  })
  export default navStore