import React from 'react';
import withAuthHOC from './../components/withAuthHOC';
import FantasyScreen from './FantasyScreen';
import MyHomeScreen from './MyHomeScreen';


export const AuthHomeScreen = withAuthHOC(MyHomeScreen);

AuthHomeScreen.navigationOptions = {
    header: null,
  };

