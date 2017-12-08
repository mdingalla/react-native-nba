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



export default class FantasyScreen extends React.Component {
    static navigationOptions = {
      title: 'Fantasy',
    };

    render() {
        return (
            <View>
                <Text>Fantasy</Text>
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