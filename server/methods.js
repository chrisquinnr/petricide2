import { Meteor } from 'meteor/meteor';
import { Clients, Rooms } from '/common/collections';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
const specialsList = [
  {'smash': [{mode:'create', q:9}], 'probability': 0.2},
  {'crash': [{mode:'remove', target: 'opp', q:9}], 'probability': 0.2},
  {'shoot': [{mode:'create', target: 'both', q:12}], 'probability': 0.5}
]

Meteor.methods({
  clear:()=>{
    Clients.remove({});
    Rooms.remove({});
  },
  getSpecial:()=>{
    // get list, return random
    let seed = Random.choice(_.range(100));
    let target = Random.choice(specialsList)
    if((target.probability * 100) < seed){
      console.log('bang');
    } else {
      console.log('miss');
    }
    // ascertain probability on each special, get random seed
  }
})
