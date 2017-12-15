
import * as _ from 'lodash';


export function mapGames(games) {
    games = _.filter(games, function(g) { return typeof(g) === 'object'; });
    games = _.map(games, function(g) { return ( _.isArray(g.game) ) ? g.game[0] : g.game; });
  
    return games;
};