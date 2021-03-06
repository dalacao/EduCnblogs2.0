import Config from '../config';
import api from '../api/api.js';
import {authData,err_info} from '../config';
import * as Service from '../request/request.js';
import MyAdapter from './MyAdapter.js';
import React, { Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    TextInput,
    FlatList,
    TouchableOpacity,
    Modal,
    ToastAndroid,
    Dimensions,
    PixelRatio,
    Alert
} from 'react-native';

import Swipeout from 'react-native-swipeout';
import { getHeaderStyle } from '../styles/theme-context';

const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
let dialogWidth = screenWidth-80;
const minMoveDistance = (15<0.1*screenWidth)?15:0.1*screenWidth;

GetBlogApp = (url)=>{
    let ret = '';
    for(var i = 23; i < url.length; i++)
    {
        if(url[i] == '/')
            break;
        ret += url[i];
    }
    return ret;
}
export default class Submitted extends Component {

    static navigationOptions = ({ navigation }) => ({
        /* 使用global.theme的地方需要单独在页面写static navigationOptions,
            以便切换主题时及时更新。*/
        headerStyle: getHeaderStyle(),
        headerTintColor: global.theme.headerTintColor,
    })
    constructor(props){
        super(props);
        this.state = {
            Answers:[],
            modalVisible:false,
            modalCommentVisible:false,
            showValue:null,
            commentValue:null,
            answerId:-1,
            rowID: null,
            sectionID: null,
        }
    }
    _isMounted;
    componentWillUnmount = ()=>{
        this._isMounted = false;
    }
    componentWillMount = ()=>{
        _isMounted = true;
        let url = Config.HomeWorkAnswer + this.props.navigation.state.params.Id;
        Service.Get(url).then((jsonData)=>{
            if(jsonData!=='rejected' && _isMounted)
            {
                this.setState({
                    Answers: jsonData
                })
            }
            else{
                // ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
            }
        })
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    setCommentModalVisible(visible) {
        this.setState({modalCommentVisible: visible});
    }
    onClose() {
        this.setState({modalVisible: false});
    }
    onCommentClose() {
        this.setState({modalCommentVisible: false});
    }

    _onPressLeft(answerId){
        this.setState({
            answerId:answerId,
        });
        this.setModalVisible(true);
    }

    _onPressRight(answerId, suggestion){
        this.setState({
            answerId:answerId,
            commentValue:suggestion,
        });
        this.setCommentModalVisible(true);
    }

    _renderItem = (item) => {
        let item1 = item;
        let {answerId, key, url, title, answerer, realName, blogUrl, dateAdded, score, suggestion} = item1.item;
        let blogApp = GetBlogApp(blogUrl);

        const BtnsLeft = [{ text: '打分', type: 'delete',  onPress: ()=> this._onPressLeft(answerId)},];
        const BtnsRight = [{ text: '评论', type: 'delete', onPress: ()=>this._onPressRight(answerId,suggestion)},];
        let shouldClose = !(this.state.sectionID === 'submittedlist' && this.state.rowID === answerId);

        if(this.props.navigation.state.params.permission == 1){
            return (
                <Swipeout
                    close={shouldClose}
                    right={BtnsRight}
                    left={BtnsLeft}
                    sensitivity={minMoveDistance}
                    rowID={answerId}
                    sectionID='submittedlist'
                    autoClose={true}
                    backgroundColor= {global.theme.backgroundColor}
                    onOpen={(sectionId, rowId, direction: string) => {
                        this.setState({
                            rowID: rowId,
                            sectionID: sectionId
                        });
                    }}
                  >
                <View>
                    <TouchableOpacity
                        style = {[styles.listcontainer, {backgroundColor:global.theme.backgroundColor}]}
                        onPress = {()=>{
                            this.props.navigation.navigate('BlogDetail',
                            {Id:key, blogApp: blogApp, CommentCount: 0, Url: url, Title: title})
                        }}
                        // onLongPress = {()=>{
                        //     this.setModalVisible(true);
                        //     this.setState({
                        //         answerId:answerId,
                        //     })
                        // }}
                    >
                        <Text style = {{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginTop: 8,
                            marginBottom: 3,
                            textAlign: 'left',
                            color: global.theme.textColor,
                            fontFamily : 'serif',
                        }}>
                            {realName}
                        </Text>
                        <Text style = {{
                            fontSize: 16,
                            marginBottom: 3,
                            textAlign: 'left',
                            color: global.theme.textColor,
                            fontFamily : 'serif',
                        }}>
                            {title}
                        </Text>
                        {/* <View style = {{
                            flexDirection: 'row',
                            marginBottom: 8,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}>
                            <Text style = {{fontSize: 13, textAlign: 'right', color: 'black', flex: 1}}>
                                提交于:{' '+dateAdded.split('T')[0]+' '+dateAdded.split('T')[1].substring(0,8)}
                            </Text>
                        </View> */}
                        
                        <View style = {{
                            flexDirection: 'row',
                            marginBottom: 8,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}>
                            <Text style = {{fontSize: 13, color: global.theme.textColor}}>
                                {score == null ? "未评分" : "分数:" + score}
                            </Text>
                            <Text style = {{fontSize: 13, color: global.theme.textColor,textAlign: 'right',flex: 1}}>
                                提交于:{' '+dateAdded.split('T')[0]+' '+dateAdded.split('T')[1].substring(0,8)}
                            </Text>
                        </View>
                       
                    </TouchableOpacity>
                </View>
                </Swipeout>
            )
        }
        else{
            return (
                <Swipeout
                    close={shouldClose}
                    right={BtnsRight}
                    left={BtnsLeft}
                    sensitivity={minMoveDistance}
                    rowID={answerId}
                    sectionID='submittedlist'
                    autoClose={true}
                    backgroundColor = {global.theme.backgroundColor}
                    onOpen={(sectionId, rowId, direction: string) => {
                        this.setState({
                            rowID: rowId,
                            sectionID: sectionId
                        });
                    }}
                  >
                <View>
                    <TouchableOpacity
                        style = {[styles.listcontainer,{backgroundColor: global.theme.backgroundColor}]}
                        onPress = {()=>{
                            this.props.navigation.navigate('BlogDetail',
                            {Id:key, blogApp: blogApp, CommentCount: 0, Url: url, Title: title})
                        }}
                    >
                        <Text style = {{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginTop: 8,
                            marginBottom: 3,
                            textAlign: 'left',
                            color: global.theme.textColor,
                            fontFamily : 'serif',
                        }}>
                            {realName}
                        </Text>
                        <Text style = {{
                            fontSize: 16,
                            marginBottom: 3,
                            textAlign: 'left',
                            color: global.theme.textColor,
                            fontFamily : 'serif',
                        }}>
                            {title}
                        </Text>
                        {/* <View style = {{
                            flexDirection: 'row',
                            marginBottom: 8,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}>
                            <Text style = {{fontSize: 13, textAlign: 'right', color: 'black', flex: 1}}>
                                {未评分}
                            </Text>·
                            <Text style = {{fontSize: 13, textAlign: 'right', color: 'black', flex: 1}}>
                                提交于:{' '+dateAdded.split('T')[0]+' '+dateAdded.split('T')[1].substring(0,8)}
                            </Text>
                        </View> */}
                        <View style = {{
                            flexDirection: 'row',
                            marginBottom: 8,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}>
                            <Text style = {{fontSize: 13, color: global.theme.textColor}}>
                                {score == null ? "未评分" : "分数:" + score}
                            </Text>
                            <Text style = {{fontSize: 13, color: global.theme.textColor,textAlign: 'right',flex: 1}}>
                                提交于:{' '+dateAdded.split('T')[0]+' '+dateAdded.split('T')[1].substring(0,8)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                </Swipeout>
            )
        }
    }
    _separator = () => {
        return (
            <View style={{ height: 9.75, justifyContent: 'center'}}>
            <View style={{ height: 0.75, backgroundColor: 'rgb(100,100,100)'}}/>
            <View style={{ height: 9, backgroundColor: global.theme.seperatorColor}}/>
            </View>
        );
    }
    _onChangeText = (inputData) => {
        this.setState({showValue:inputData});
    }
    _onChangeComment = (inputData) => {
        this.setState({commentValue:inputData});
    }
    _renderModal(){
        if(this.props.navigation.state.params.permission == 1){
            return(
                <View>
                    <Modal
                        animationType={"slide"}
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {this.setModalVisible(false)}}
                    >
                        <TouchableOpacity style={{flex:1}} onPress={this.onClose.bind(this)}>
                        <View style={[styles.containerM]}>
                            <View style={styles.innerContainerM}>
                                <Text style={styles.ModalHead}>答案打分</Text>
                                <TextInput
                                    style={styles.inputtext}
                                    placeholder="分值1~100"
                                    onChangeText={this._onChangeText}
                                />
                                <View style={styles.btnContainer}>
                                    <TouchableHighlight onPress={() => {
                                        if(this.state.showValue > 100 || this.state.showValue < 0){
                                            ToastAndroid.show('请输入0~100之间的分数', ToastAndroid.LONG);
                                            return;
                                        }
                                        else{
                                            _giveMark(this.state.answerId,this.props.navigation.state.params.schoolClassId,this.state.showValue)
                                        }
                                        this.setModalVisible(!this.state.modalVisible)
                                    }}>
                                        <Text  style={styles.hidemodalTxt}>提交</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight onPress={() => {
                                        this.setModalVisible(!this.state.modalVisible)
                                    }}>
                                        <Text  style={styles.hidemodalTxt}>关闭</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            )
        }
        else{
            return(<View></View>)
        }
    }
    _renderCommentModal(){
        if(this.props.navigation.state.params.permission == 1){
            return(
                <View>
                    <Modal
                        animationType={"slide"}
                        transparent={true}
                        visible={this.state.modalCommentVisible}
                        onRequestClose={() => {this.setCommentModalVisible(false)}}
                    >
                        <TouchableOpacity style={{flex:1}} onPress={this.onCommentClose.bind(this)}>
                        <View style={styles.containerM}>
                            <View style={styles.innerContainerM}>
                                <Text style={styles.ModalHead}>答案评语</Text>
                                <TextInput
                                    style={styles.inputtext}
                                    placeholder="请输入评语内容"
                                    defaultValue ={this.state.commentValue}
                                    onChangeText={this._onChangeComment}
                                    multiline={true}
                                    underlineColorAndroid="transparent"
                                />
                                <View style={styles.btnContainer}>
                                    <TouchableHighlight onPress={() => {
                                        if(this.state.commentValue == null || this.state.commentValue.length == 0){
                                            ToastAndroid.show('请输入评语内容~', ToastAndroid.LONG);
                                            return;
                                        }
                                        else{
                                            _giveComment(this.state.answerId,this.props.navigation.state.params.schoolClassId,this.state.commentValue)                   
                                        }
                                        this.setCommentModalVisible(!this.state.modalCommentVisible)
                                    }}>
                                        <Text  style={styles.hidemodalTxt}>提交</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight onPress={() => {
                                        this.setCommentModalVisible(!this.state.modalCommentVisible)
                                    }}>
                                        <Text  style={styles.hidemodalTxt}>关闭</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            )
        }
        else{
            return(<View></View>)
        }
    }
    render(){
        let data = [];
        for(var i in this.state.Answers)
        {
            data.push({
                answerId:this.state.Answers[i].answerId,
                key: this.state.Answers[i].entryId,
                url: this.state.Answers[i].url,
                title: this.state.Answers[i].title,
                answerer: this.state.Answers[i].answerer,
                realName: this.state.Answers[i].realName,
                blogUrl: this.state.Answers[i].blogUrl,
                dateAdded: this.state.Answers[i].dateAdded,
                score: this.state.Answers[i].score,
                suggestion:this.state.Answers[i].suggestion,
            });
        }
        return(
            <View style = {[styles.container,{backgroundColor:global.theme.backgroundColor}]}>
                {this._renderModal()}
                {this._renderCommentModal()}
                <View style = {styles.content}>
                    <FlatList
                        ItemSeparatorComponent={this._separator}
                        renderItem={this._renderItem}
                        data={data}
                        refreshing= {false}
                        ListFooterComponent={this._separator}
                    />
                </View>
            </View>
        )
    }

}
function _giveMark(answerId, schoolClassId, score){
    let url = 'https://api.cnblogs.com/api/edu/answer/marking/' + answerId;
    let body= JSON.stringify({
        answerId:answerId,
        schoolClassId:schoolClassId,
        score:score,
    });
    Service.UserAction(url,body, 'PATCH').then((response)=>{
        if(response.status!==200)
        {
            return null;
        }
        else{
            return response.json();
        }
    }).then((jsonData)=>{
        if(jsonData != 'rejected'){
            if(jsonData.isSuccess == true){
                ToastAndroid.show("打分成功~",ToastAndroid.LONG);
            }
            else if(jsonData.isWarning == true){
                ToastAndroid.show(jsonData.message,ToastAndroid.LONG);
            }
        }
        else{
            ToastAndroid.show("请求错误，请稍后再试",ToastAndroid.LONG);
        }
    })
}
function _giveComment(answerId, schoolClassId, commentValue){
    let url = 'https://api.cnblogs.com/api/edu/answer/suggest/' + answerId;
    let body= JSON.stringify({
        answerId:answerId,
        schoolClassId:schoolClassId,
        suggestion:commentValue,
    });
    Service.UserAction(url,body, 'PATCH').then((response)=>{
        if(response.status!==200)
        {
            return null;
        }
        else{
            return response.json();
        }
    }).then((jsonData)=>{
        if(jsonData != 'rejected'){
            if(jsonData.isSuccess == true){
                ToastAndroid.show("评价成功~",ToastAndroid.LONG);
            }
            else if(jsonData.isWarning == true){
                ToastAndroid.show(jsonData.message,ToastAndroid.LONG);
            }
        }
        else{
            ToastAndroid.show("请求错误，请稍后再试",ToastAndroid.LONG);
        }
    })
}
const styles = StyleSheet.create({
    containerM: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    innerContainerM: {
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20

    },
    ModalHead:{
        color:'#000000',
        fontSize:18,
    },
    btnContainer:{
        flexDirection:'row',
        justifyContent:'space-around',
        width:dialogWidth,
        borderTopWidth:1,
        borderTopColor:'#ffffff',
        alignItems:'center'
    },
    inputtext:{
        // padding:0,
        width:dialogWidth-20,
        margin:10,
        // color:'#000000',
    },
    hidemodalTxt: {
        marginTop:10,
        // color:'#000000',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
       // backgroundColor: 'white',
    },
    content: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        flex:1,
    },
    listcontainer: {
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        flex:1,
        alignSelf: 'stretch',
        backgroundColor: 'white',
        paddingLeft: 0.03*screenWidth,
        paddingRight: 0.04*screenWidth,
    }
});
