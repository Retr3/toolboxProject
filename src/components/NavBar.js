import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtNavBar } from 'taro-ui'
import './navBar.scss'

class NavBar extends Component{
    constructor(props) {
        super(props);
    }
    goBackPre=()=>{
        Taro.navigateBack();
    }
    render(){
        const { param } = this.props; 
        let classtyle = param?param.classtyle:'';
        let navstyle = param?(param.navstyle?param.navstyle:'bar-transparent'):'bar-transparent';
        let title = param?param.title:"";
        let color = param?(param.color?param.color:"#333"):"#333";
        let statusHeight = param?param.statusHeight:0;
        let navHeight = param?param.navHeight:0;
        let leftIconType = param?(param.leftIconType?(param.leftIconType==="index"?"index":param.leftIconType):'chevron-left'):'chevron-left';
        return(<View className={classtyle+" bar-fix"} style={'width:100vw'}>
                    <View style={`height:${statusHeight}px;width:100%`}></View>
                    <View  style={`height:${navHeight}px`}>
                        {leftIconType==="index"?<AtNavBar
                            className={navstyle}
                            onClickLeftIcon={this.goBackPre}
                            color={color}
                            title={title}
                            border={false}
                        />:<AtNavBar
                            className={navstyle}
                            onClickLeftIcon={this.goBackPre}
                            color={color}
                            title={title}
                            border={false}
                            leftIconType={leftIconType}
                        />}
                        
                    </View>
                </View>)
    }
}
export default NavBar