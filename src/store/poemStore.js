import { observable } from 'mobx'

const poemStore = observable({
    poemInfo:{
        poemType:'5',
        offset:'1',
        yayun:'1',
        text:''
    },
    changePoemInfo(newInfo){
      this.poemInfo = newInfo;
    }
  })
  export default poemStore