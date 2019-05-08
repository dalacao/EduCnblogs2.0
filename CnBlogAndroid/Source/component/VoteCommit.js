import React, {Component} from 'react';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import Config from '../config';
import * as Service from '../request/request.js'
import Vote from './Vote';
const extractVoteContentData = require('../DataHandler/VoteContent');

VoteCommitProps = {
    memberId: PropTypes.number.isRequired,
    voteId: PropTypes.number.isRequired,
    voteContent: PropTypes.array.isRequired,
    headerComponent: PropTypes.func,
    footerComponent: PropTypes.func,
};

export default class VoteCommit extends Component {
    constructor(props) {
        super(props);
        this.committedOptionsURL = Config.VoteCommittedOptions + this.props.memberId + 
                '/' + this.props.voteId;
        this.state = {
            data: extractVoteContentData(this.props.voteContent),
        }
        this.headerComponent = this.props.headerComponent ? this.props.headerComponent : null; 
        this.footerComponent = this.props.footerComponent ? this.props.footerComponent : null;
    }

    _isMounted;

    componentWillMount() {
        let data = extractVoteContentData(this.props.voteContent);
        this._isMounted = true;
        Service.Get(this.committedOptionsURL)
        .then((jsonData) => {
            if (jsonData == null) {
                return; // 没有投票
            }
            for (let voteContentId in jsonData) {
                let selectedOptionsText = jsonData[voteContentId];
                for (let i in data) { // data是voteContent转换后的，可以提供给Vote组件的数据
                    if (voteContentId != data[i].contentId) {
                        continue;
                    }
                    // 对于相同的题目
                    let options = data[i].options;
                    for (let j in options) {
                        for (let k in selectedOptionsText) {
                            // 如果某个选项被选中
                            if (selectedOptionsText[k] == options[j].text) {
                                // 则设置其selected为true
                                options[j].selected = true;
                            }
                        }
                    }
                }
            }
            if (this._isMounted) {
                this.setState({data: data});
            }
        })
        .catch(error => {alert(error)});
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View style={{flex:1}}>
                <Vote
                    data={this.state.data}
                    disabled={true}
                    headerComponent={this.headerComponent}
                    footerComponent={this.footerComponent}
                />
            </View>
        )
    }
}

VoteCommit.PropTypes = VoteCommitProps;