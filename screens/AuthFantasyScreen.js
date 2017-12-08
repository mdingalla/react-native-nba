import React from 'react';
import withAuthHOC from './../components/withAuthHOC';
import FantasyScreen from './FantasyScreen';



  
export const AuthFantasyScreen = withAuthHOC(FantasyScreen);

AuthFantasyScreen.navigationOptions = {
    title: 'Fantasy',
  };

