import { observable } from 'mobx'
let d=new Date()
const todayHistoryStore = observable({
  todayHistoryEven: "",
  changeTodayHistoryEven(newEven){
    this.todayHistoryEven = newEven;
  }
})
export default todayHistoryStore