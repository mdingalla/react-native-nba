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
  
  // const REFRESH_TOKEN = '@NBEY:REFRESH_TOKEN';
  const REFRESH_TOKEN = 'REFRESH_TOKEN';


export default function withAuthHOC(WrappedComponent) {

    class WithAuthHOC extends React.Component {


        constructor(props)
        {
          super(props);
          
              this.state = {
                refresh_token: '',
                auth_state: '',
                profile: {
                  imageUrl: 'assets/images/robot-dev.png',
                  nickname: '',
                },
              };
      
          // this.OAuth = this.OAuth.bind(this);
          // this.getProfileData = this.getProfileData.bind(this);
          this.getToken = this.getToken.bind(this);
          this.logout = this.logout.bind(this);
          this.getProfileData = this.getProfileData.bind(this);
      
        }
      
        componentDidMount() {
          console.log('withAuthHOC cpdm');
          AsyncStorage.getItem(REFRESH_TOKEN).then((value)=>{
            console.log(value);
            if(value)
            {
              this.setState({
                refresh_token:value
              });
              this.getToken(value, 'refresh_token');
            }
            
          }).catch((err)=>{
            console.log(err);
            this.props.navigation.navigate('Login');
          })
      
        }
      
        
      
        getToken(codeOrToken, tokenType){
          console.log('withAuthHOC getToken');
          let bodyJson;
          switch(tokenType){
            case 'access_token':
              console.log(`code: ${codeOrToken}`);
              bodyJson = {
                client_id: config.client_id,
                client_secret: config.client_secret,
                redirect_uri: 'oob',
                code: codeOrToken,
                grant_type: 'authorization_code',
              };
              break;
            case 'refresh_token':
              console.log(`refresh_token: ${codeOrToken}`);
              bodyJson = {
                client_id: config.client_id,
                client_secret: config.client_secret,
                redirect_uri: 'oob',
                refresh_token: codeOrToken,
                grant_type: 'refresh_token',
              };
              break;
            default:
              console.error('Unidentified token type');
          }
      
          const tokenurl = `https://api.login.yahoo.com/oauth2/get_token`;
          const authcode = base64.encode(`${config.client_id}:${config.client_secret}`);
          console.log('authcode ' + authcode);
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
      
            if (token.error) {
              AsyncStorage.removeItem(REFRESH_TOKEN, () => {
                this.setState({
                  refresh_token: '',
                  auth_state: '',
                  profile: {
                    imageUrl: 'assets/images/robot-dev.png',
                    nickname: '',
                  },
                });
              });
            }
            else if (token.refresh_token) {
              // store refresh_token
              AsyncStorage.setItem(REFRESH_TOKEN, token.refresh_token);
      
              this.setState({
                refresh_token: token.refresh_token,
              });
      
              // fetch profile
              this.getProfileData(token);
            }
          }).catch(err => console.error('Error fetching token', err));
        }
      
        getProfileData(tokenData){
          const dataurl = `https://social.yahooapis.com/v1/user/${tokenData.xoauth_yahoo_guid}/profile?format=json`;
          fetch(dataurl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`
            }
          }).then(res => {
            return res.json();
          }).then(profileData => {
            console.log(`User profile: ${JSON.stringify(profileData)}`);
      
            this.setState({
              profile: {
                imageUrl: profileData.profile.image.imageUrl,
                nickname: profileData.profile.nickname,
              }
            });
          }).catch(err => console.error('Error fetching profile data', err));
        }

        logout(){
          AsyncStorage.removeItem(REFRESH_TOKEN, () => {
            this.setState({
              refresh_token: '',
              auth_state: '',
              profile: {
                imageUrl: 'assets/images/robot-dev.png',
                nickname: '',
              },
            });
          });
        }

        render() {
            return (
                <WrappedComponent {...this.props} />
            );
        }
    }

    WithAuthHOC.displayName = `WithSubscription(${getDisplayName(WrappedComponent)})`;
    return WithAuthHOC;

}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
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

