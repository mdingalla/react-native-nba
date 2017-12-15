import React from 'react';
import * as _ from 'lodash';
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Linking,
  AsyncStorage,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from './../config.js';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import qs from 'qs';
import base64 from 'base-64';
import Fantasy from '../api/fantasyAPi';



export default class FantasyScreen extends React.Component {
    static navigationOptions = {
      title: 'Fantasy',
    };

    constructor(props)
    {
        super(props);

        this.state = {
            games:[]
        }
    }

    componentDidMount()
    {
        console.log('cpdm MyFantasy');
        Fantasy.getGames().then(data=>{
             console.log(mappedGames(data.fantasy_content.users[0].user[1].games));
            //  console.log(data.fantasy_content.users[0].user[1].games);
            this.setState({
                games:mappedGames(data.fantasy_content.users[0].user[1].games)
            });
        });
    }

    render() {
        let games = this.state.games;
        let mlist = games.map((item)=>{
            return <Text key={item.game_id}>{item.name}-{item.season}</Text>
        })

        return (
            <View>
                {mlist}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    }
});

function mappedGames(games) {
    games = _.filter(games, function(g) { return typeof(g) === 'object'; });
    games = _.map(games, function(g) { return ( _.isArray(g.game) ) ? g.game[0] : g.game; });
  
    return games;
  };

