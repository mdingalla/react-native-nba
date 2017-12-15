import {
    AsyncStorage,
  } from 'react-native';

import {fantasyUrl} from '../fantasy/users'

const REFRESH_TOKEN = 'REFRESH_TOKEN';
const ACCESS_TOKEN = 'ACCESS_TOKEN';



class Fantasy {

    static getGames()
    {
     
        return AsyncStorage.getItem(ACCESS_TOKEN)
        .then((token)=>{
         console.log('fantasy token:' + token);
          return fetch(fantasyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }).then(res => {
            return res.json();
          });
         
        });
        
    }
}

export default Fantasy;
