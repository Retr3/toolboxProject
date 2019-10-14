import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,Navigator } from '@tarojs/components'
import { AtButton,AtList, AtListItem} from 'taro-ui'
class About extends Component{
    config = {
        navigationBarTitleText: '关于'
      }
    render(){
        return (<View>
                    about
                </View>)
    }
}
export default About