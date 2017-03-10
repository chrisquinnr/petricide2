import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Streamy } from 'meteor/yuukan:streamy';
import { Clients } from '/common/collections';
import { ReactiveDict } from 'meteor/reactive-dict';
import * as logic from '/client/utils/reactive-vars';
import { Messages } from '/client/utils/collections';
import { State } from '/client/utils/collections';

// On connected, subscribe to collections
Streamy.onConnect(function() {
  Meteor.subscribe('clients');
  Meteor.subscribe('rooms', Streamy.id());
});

// On disconnect, reset nick name
Streamy.onDisconnect(function() {
  logic.nick.set('');
  Messages.remove({});
});

/**
 *
 */
Streamy.on('nick_ack', function( data ) {
  logic.nick.set(data.nick);
});

/**
 * Game Joined!
 *
 */
Streamy.on('__join__', function( data ) {
  
  // Excluding host joining
  if (data.sid === Streamy.id()) {
    return;
  }
  
  // Only want people joining our current game
  if (data.room === logic.room.get()) {
    let c = Clients.findOne({ 'sid': data.sid }); // lookup opponent nickname
    if (c && c.nick) {
      let opps = logic.opponent.get();
      opps.push(c.nick);
      logic.opponent.set(opps);
    }
    
    // Emit a message to the newcomer, along with our ID
    Streamy.rooms(logic.room.get()).emit('match__found', { data: { opponent: Streamy.id() } });
  }
});

/**
 * When you've joined a game and have an opponent ID
 */
Streamy.on('match__found', ( data ) => {
  
  // reject our own events
  if (data.data.opponent === Streamy.id()) {
    return false;
  } else {
    if (data.__in === logic.room.get()) {
      let c = Clients.findOne({ 'sid': data.data.opponent });
      if (c && c.nick) {
        let opps = logic.opponent.get();
        opps.push(c.nick);
        logic.opponent.set(_.uniq(opps));
      }
    }
  }
});


Streamy.on('__cellClick__', ( data ) => {
  if (!data) return false;
  
  let d = data.data;
  
  let col = logic.color.get();
  if (d.player !== Streamy.id()) {
    col = d.color;
  }
  console.log(d);
  State.insert({data: d, room: logic.room.get()});
  
  let cols = logic.colorChoices.get();
  _.each(cols, ( c ) => {
    $('.rowCell[data-row=' + d.row + '][data-position=' + d.position + ']').removeClass(c.class);
  });
  
  $('.rowCell[data-row=' + d.row + '][data-position=' + d.position + ']').addClass(col);
  
});


// Someone has left
Streamy.on('__leave__', function( data ) {
  let opp = logic.opponent.get();
  let c = Clients.findOne({ 'sid': data.sid });
  let mod = _.without(opp, c.nick);
  logic.opponent.set(mod);
});