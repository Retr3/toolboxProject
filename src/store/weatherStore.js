import { observable } from 'mobx'
const weatherStore = observable({
  weatherInfo: "",
  getWeatherInfo(info){
    this.weatherInfo = info;
  }
})
export default weatherStore