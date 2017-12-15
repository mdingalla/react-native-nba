import React from 'react';
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
// import MyFantasy from '../api/fantasyAPi';



export default class FantasyScreen extends React.Component {
    static navigationOptions = {
      title: 'Fantasy',
    };

    componentDidMount()
    {
        console.log('cpdm MyFantasy');
    }

    render() {
        return (
            <View>
                <Text></Text>
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