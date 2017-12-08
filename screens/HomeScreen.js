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

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props)
  {
    super(props);
    
        this.state = {
          refresh_token: '',
          auth_state: '',
          profile: {
            imageUrl: '',
            nickname: '',
          },
        };

    // this.OAuth = this.OAuth.bind(this);
    // this.getProfileData = this.getProfileData.bind(this);
    this.getToken = this.getToken.bind(this);
    this.logout = this.logout.bind(this);
    this._getProfileData = this._getProfileData.bind(this);

  }

  componentDidMount() {
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
              imageUrl: '',
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
          imageUrl: '',
          nickname: '',
        },
      });
    });
  }
  

  render() {
    let notLogged = null;
    let imageProfile = null;
    let imageProfileLink = require('../assets/images/robot-dev.png');
    if(!this.state.refresh_token)
    {
      notLogged = <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Image
            source={
              __DEV__
                ? require('../assets/images/robot-dev.png')
                : require('../assets/images/robot-prod.png')
            }
            style={styles.welcomeImage}
          />
        </View>

        <View style={styles.getStartedContainer}>
          {this._maybeRenderDevelopmentModeWarning()}

          <Text style={styles.getStartedText}>Get started by opening</Text>

          <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
            <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
          </View>

          <Text style={styles.getStartedText}>
            Change this text and your app will automatically reload.
          </Text>
        </View>

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Button  title="Login" onPress={this._handleLoginPress} color="#841584"/>
        </View>
      </ScrollView>
    }
    else 
    {
      if(this.state.profile)
      {
        imageProfileLink = {uri:this.state.profile.imageUrl};
        imageProfile = <Image source={imageProfileLink} />
      }
      notLogged =<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.getStartedContainer}>
            <Text>{this.state.profile.nickname}</Text>
          </View>
        {imageProfile}
          <View style={styles.helpContainer}>
          <Button  title="Logout" onPress={this.logout} color="#841584"/>
        </View>
        </ScrollView>
    }
    return (
      <View style={styles.container}>
        {notLogged}

        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
          </View>
        </View>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };

  _handleLoginPress = () => {
    this.props.navigation.navigate('Login');
  }

  _getProfileData(tokenData){
    const dataurl = `https://social.yahooapis.com/v1/user/${tokenData}/profile?format=json`;
    fetch(dataurl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
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
      },()=>{
        this.props.navigation.navigate('Home');
      });
    }).catch(err => console.error('Error fetching profile data', err));
  }
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
