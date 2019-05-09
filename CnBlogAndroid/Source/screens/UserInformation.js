import Config from '../config';
import api from '../api/api.js';
import {authData,StorageKey,err_info,UI} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
//关于cookie包的配置方法，请看https://github.com/joeferraro/react-native-cookies
import CookieManager from 'react-native-cookies'
import * as storage from '../Storage/storage.js'
import * as umengPush from '../umeng/umengPush'
import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    Switch,
    TouchableHighlight,
    ScrollView
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
    NavigationActions
} from 'react-navigation';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;

export default class UserInformation extends Component{
    constructor(props){
        super(props);
        this.state={
            faceurl:'',
            DisplayName: '',
            BlogApp: '',
            Seniority: '',
            receive_push : false
        }
    }

    async _getReceivePush(){
        var receive_push = await storage.getItem(StorageKey.RECEIVE_PUSH);
        if(receive_push === null){
            storage.setItem(StorageKey.RECEIVE_PUSH,'true');
            this.setState({
                receive_push:true
            })
        }
        else{
            let bool = receive_push == 'true';
            this.setState({
                receive_push:bool
            })
        }
    }

    async openReceive(){
        umengPush.openPush();
        var ret = await storage.setItem(StorageKey.RECEIVE_PUSH,'true');
        return ret;
    }

    async closeReceive(){
        umengPush.closePush();
        var ret = await storage.setItem(StorageKey.RECEIVE_PUSH,'false');
        return ret;
    }

    _logout=()=>{
        // 简单的清空浏览记录
        global.storage.save({key: StorageKey.BLOG_LIST, data: []});
        storage.removeItem(StorageKey.RECEIVE_PUSH).then(
            storage.removeItem(StorageKey.USER_TOKEN).then((res)=>{
                CookieManager.clearAll()
                .then((res)=>{
                    umengPush.deleteAllTags();
    //                this.props.navigation.navigate('Loginer');
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'Loginer'}),
                        ]
                    });
                    this.props.navigation.dispatch(resetAction);
                })
            })
        )
    }
    _isMounted;
    componentWillUnmount=()=>{
        this._isMounted=false;
    }

    componentWillMount=()=>{
        this._isMounted=true;
        let user_url = Config.apiDomain + api.user.info;
        this._getReceivePush().then(
            Service.Get(user_url)
            .then((jsonData)=>{
                global.user_information = {
                    userId : jsonData.UserId,
                    SpaceUserId : jsonData.SpaceUserId,
                    BlogId : jsonData.BlogId,
                    DisplayName : jsonData.DisplayName,
                    face : jsonData.Face,
                    Seniority : jsonData.Seniority,  //园龄
                    BlogApp : jsonData.BlogApp
                }
            })
            .then(()=>{
                if(this._isMounted){
                this.setState({
                    faceurl: global.user_information.face,
                    DisplayName: global.user_information.DisplayName,
                    BlogApp: global.user_information.BlogApp,
                    Seniority: global.user_information.Seniority,
                })}
            }).then(()=>{
                global.storage.save({key:StorageKey.DISPLAYNAME,data:this.state.DisplayName});
            }).then(()=>{
                global.storage.save({key:StorageKey.BLOGAPP,data:this.state.BlogApp});
            }).then(()=>{
                global.storage.save({key:StorageKey.SENIORITY,data:this.state.Seniority});
            })
            .catch((error)=>{
                ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT)
                global.storage.load({key:StorageKey.DISPLAYNAME})
                .then((ret)=>{
                    this.setState({
                        DisplayName : ret,
                    })
                }).then(()=>{
                    global.storage.load({key:StorageKey.BLOGAPP})
                    .then((ret)=>{
                        this.setState({
                            BlogApp : ret,
                        })
                    })
                }).then(()=>{
                    global.storage.load({key:StorageKey.SENIORITY})
                    .then((ret)=>{
                        this.setState({
                            Seniority : ret,
                            faceurl : '',
                        })
                    })
                })
                .catch((err)=>{
                    ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
                    this.props.navigation.navigate('Loginer');
                })
            })
        )
    }

    /**从版本号中启动设置功能，需要调用此函数重新render */
    rerender = () => {
        this.forceUpdate();
    }

    render() {
    let blogUrl = this.state.BlogApp == null || this.state.BlogApp == '' ? '您尚未开通博客主页' : 'https://www.cnblogs.com/' + this.state.BlogApp;
    return (
        <ScrollView>
        <View
            style= {{
                flexDirection: 'column',
                flex: 1,
            }}
        >
            <View style= {{
                flexDirection: 'row',
                justifyContent:'flex-start',
                alignItems: 'center',
                marginBottom: 0.01*screenHeight,
                backgroundColor: UI.TOP_COLOR,
                height: screenHeight/16,
                paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'white'}}>个人信息</Text>
            </View>
            <View style= {{
                flexDirection: 'row',
                justifyContent:'flex-start',
                alignItems: 'center',
                marginBottom: 0.005*screenHeight,
                backgroundColor: 'white',
                height: 0.15*screenHeight,
                paddingLeft: 0.05*screenWidth,
            }}
            >
                <Image
                    style= {{
                        width: 0.1*screenHeight,
                        height: 0.1*screenHeight,
                    }}
                    source={{uri: this.state.faceurl?this.state.faceurl:'../images/defaultface.png'}}
                />
                <View style = {{justifyContent: 'center',paddingLeft: 0.05*screenWidth,}}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>用户昵称:</Text>
                <Text style = {{fontSize: 15}}>{this.state.DisplayName}</Text>
                </View>
            </View>
            <View style = {{
                justifyContent:'center',
                alignItems: 'flex-start',
                height: 0.1*screenHeight,
                marginBottom: 0.005*screenHeight,
                backgroundColor: 'white',
                paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>博客地址:</Text>
                <Text style = {{fontSize: 15}}>{blogUrl}</Text>
            </View>
            <View style = {{
                justifyContent:'center',
                alignItems: 'flex-start',
                height: 0.1*screenHeight,
                marginBottom: 0.005*screenHeight,
                backgroundColor: 'white',
                paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>园龄:</Text>
                <Text style = {{fontSize: 15}}>{this.state.Seniority}</Text>
            </View>
            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{this.props.navigation.navigate('ScheduleReminding');}}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.005*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>日程提醒</Text>
            </TouchableHighlight>
            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{this.props.navigation.navigate('BookmarksList');}}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.005*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>收藏列表</Text>
            </TouchableHighlight>
            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{this.props.navigation.navigate('HistoryList');}}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.005*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>浏览记录</Text>
            </TouchableHighlight>

            {
                global.settings.showSettings ? (
                    <TouchableHighlight
                        underlayColor="white"
                        activeOpacity={0.5}
                        onPress={()=>{this.props.navigation.navigate('Settings');}}//关联函数
                        style = {{
                            justifyContent:'center',
                            alignItems: 'flex-start',
                            height: 0.07*screenHeight,
                            marginBottom: 0.02*screenHeight,
                            backgroundColor: 'white',
                            paddingLeft: 0.05*screenWidth,
                    }}>
                        <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>设置</Text>
                    </TouchableHighlight>
                ) : (null)
            }

            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{
                    this.props.navigation.navigate('AppInformation', {
                        callback: this.rerender,
                    }
                )}}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.01*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>关于App</Text>
            </TouchableHighlight>

            <View
                underlayColor="white"
                // activeOpacity={0.5}
                // onPress={()=>{
                //     umengPush.testPush();
                // }}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.01*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
            <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>接收推送</Text>
            <Switch
                onTintColor='#aadfd9'  //开关打开时的背景颜色
                thumbTintColor='#ececec' //开关上按钮的颜色
                tintColor='#abb0b4' //关闭时背景颜色
                value={this.state.receive_push}
                onValueChange={(value) =>{
                    if(value == false){
                        this.closeReceive().then(()=>{
                            this.setState({
                                receive_push:false
                            })
                        }).then(storage.getItem(StorageKey.RECEIVE_PUSH).then((ret)=>{console.log(ret);}));
                    }
                    else{
                        this.openReceive().then(()=>{
                            this.setState({
                                receive_push:true
                            })
                        }).then(storage.getItem(StorageKey.RECEIVE_PUSH).then((ret)=>{console.log(ret);}));
                    }
                } }
            />
            </View>

            <TouchableHighlight
                underlayColor="white"
                activeOpacity={0.5}
                onPress={()=>{
                    umengPush.testPush();
                }}//关联函数
                style = {{
                    justifyContent:'center',
                    alignItems: 'flex-start',
                    height: 0.07*screenHeight,
                    marginBottom: 0.03*screenHeight,
                    backgroundColor: 'white',
                    paddingLeft: 0.05*screenWidth,
            }}>
            <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>测试按钮</Text>
            </TouchableHighlight>
            <TouchableOpacity style = {{
                justifyContent:'center',
                alignItems: 'flex-start',
                height: 0.07*screenHeight,
                backgroundColor: 'rgb(204,255,255)',
                paddingLeft: 0.05*screenWidth,
            }}
                onPress = {this._logout.bind(this)}
            >
                <Text style = {{fontSize: 18, fontWeight: 'bold', color:'rgb(51,51,51)'}}>退出登录</Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
