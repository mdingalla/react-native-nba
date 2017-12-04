import React from 'react';

import {
  AppRegistry,
  AsyncStorage,
  Button,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView,
  LinkingIOS,
} from 'react-native';
import config from './../config.js';
import { WebBrowser } from 'expo';
import qs from 'qs';
import base64 from 'base-64';

import { MonoText } from '../components/StyledText';

const REFRESH_TOKEN = 'REFRESH_TOKEN';



export default class LoginScreen extends React.Component {
    static navigationOptions = {
        title:'Login',
    };

    constructor(props){
      super(props);
      let client_id = config.client_id;
      let state =  Math.random() + '';

      let moauthurl = 'https://api.login.yahoo.com/oauth2/request_auth?'+
        qs.stringify({
          client_id,
          response_type: 'code',
          language: 'en-us',
          redirect_uri: 'oob',
          state,
      });

      console.log(moauthurl);


      this.state = {
        url:moauthurl,
        pstate:state
      }

      this._handleOAuth = this._handleOAuth.bind(this);
      this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
      this._onMessage = this._onMessage.bind(this);
    }



    _onNavigationStateChange(event){
      console.log(event);
      
      if(event.title == 'Example Domain')
      {
        
        const [, query_string] = event.url.match(/\?(.*)/);
        console.log(query_string);
    
        const query = qs.parse(query_string);
        console.log(`query: ${JSON.stringify(query)}`);
    
        if (query.state === this.state.pstate) {
          getToken(query.code, 'access_token', getProfileData);
        } else {
          console.error('Error authorizing oauth redirection');
        }
      }

      if(event.url == 'https://api.login.yahoo.com/oauth2/authorize'
       && event.canGoBack)
      {
        this.refs.myWebView.postMessage('webview');
        
      }
    }

    componentDidMount() {
     
      
    }

    _handleOAuth(client_id, cb) {
      // Get code
      // for secure authorization
        const state = Math.random() + '';
      
        const oauthurl = 'https://api.login.yahoo.com/oauth2/request_auth?'+
                  qs.stringify({
                    client_id,
                    response_type: 'code',
                    language: 'en-us',
                    redirect_uri: 'http://example.com',
                    state,
                  });
    } 

    _onMessage(e)
    {
       if(e.nativeEvent.data)
       {
        console.log(e.nativeEvent.data);
        getToken(e.nativeEvent.data, 'access_token');
       }
    }
      
    render(){
        let jsCode = `
        document.addEventListener('message', function(e) {
          window.postMessage(document.getElementsByClassName('oauth2-code')[0].innerHTML);
        });
        `

        return (
            <View style={styles.container}>
                  <WebView source={{uri: this.state.url}}
                    ref="myWebView"
                    javaScriptEnabled={true}
                    injectedJavaScript={jsCode}
                    onMessage={this._onMessage}
                    onNavigationStateChange={this._onNavigationStateChange}
                  />
            </View>
            )
    }
}



// function getToken(codeOrToken, tokenType, cb){
function getToken(codeOrToken, tokenType){
  let bodyJson;
  switch(tokenType){
    case 'access_token':
      console.log(`code: ${codeOrToken}`);
      bodyJson = {
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: 'oob',
        code: codeOrToken,
        grant_type: 'authorization_code'
      };
      break;
    case 'refresh_token':
      console.log(`refresh_token: ${codeOrToken}`);
      bodyJson = {
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: 'oob',
        refresh_token: codeOrToken,
        grant_type: 'refresh_token'
      };
      break;
    default:
      console.error('Unidentified token type');
  }

  const tokenurl = 'https://api.login.yahoo.com/oauth2/get_token';
  const authcode = base64.encode(`${config.client_id}:${config.client_secret}`);
  
  fetch(tokenurl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${authcode}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: build_query(bodyJson,5)
  }).then(res => {
    return res.json();
  }).then(token => {
    console.log(`token res: ${JSON.stringify(token)}`);
  }).catch(err => console.error('Error fetching token', err));
}

function getProfileData(tokenData){
  console.log(tokenData);

  const dataurl = `https://social.yahooapis.com/v1/user/${tokenData.xoauth_yahoo_guid}/profile?format=json`;

  console.log(dataurl);

  fetch(dataurl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  }).then(res => {
    return res.json();
  }).then(profile => {
    console.log(`User profile: ${JSON.stringify(profile)}`);
  }).catch(err => console.error('Error fetching profile data', err));
}

function build_query(obj, num_prefix, temp_key) {
  
    var output_string = []
  
    Object.keys(obj).forEach(function (val) {
  
      var key = val;
  
      num_prefix && !isNaN(key) ? key = num_prefix + key : ''
  
      var key = encodeURIComponent(key.replace(/[!'()*]/g, escape));
      temp_key ? key = temp_key + '[' + key + ']' : ''
  
      if (typeof obj[val] === 'object') {
        var query = build_query(obj[val], null, key)
        output_string.push(query)
      }
  
      else {
        var value = encodeURIComponent(obj[val].replace(/[!'()*]/g, escape));
        output_string.push(key + '=' + value)
      }
  
    })
  
    return output_string.join('&')
  
  }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    developmentModeText: {
      marginBottom: 20,
      color: 'rgba(0,0,0,0.4)',
      fontSize: 14,
      lineHeight: 19,
      textAlign: 'center',
    },
    contentContainer: {
      paddingTop: 30,
    },
    welcomeContainer: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    welcomeImage: {
      width: 100,
      height: 80,
      resizeMode: 'contain',
      marginTop: 3,
      marginLeft: -10,
    },
    getStartedContainer: {
      alignItems: 'center',
      marginHorizontal: 50,
    },
    homeScreenFilename: {
      marginVertical: 7,
    },
    codeHighlightText: {
      color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 3,
      paddingHorizontal: 4,
    },
    getStartedText: {
      fontSize: 17,
      color: 'rgba(96,100,109, 1)',
      lineHeight: 24,
      textAlign: 'center',
    },
    tabBarInfoContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      ...Platform.select({
        ios: {
          shadowColor: 'black',
          shadowOffset: { height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 20,
        },
      }),
      alignItems: 'center',
      backgroundColor: '#fbfbfb',
      paddingVertical: 20,
    },
    tabBarInfoText: {
      fontSize: 17,
      color: 'rgba(96,100,109, 1)',
      textAlign: 'center',
    },
    navigationFilename: {
      marginTop: 5,
    },
    helpContainer: {
      marginTop: 15,
      alignItems: 'center',
    },
    helpLink: {
      paddingVertical: 15,
    },
    helpLinkText: {
      fontSize: 14,
      color: '#2e78b7',
    },
  });