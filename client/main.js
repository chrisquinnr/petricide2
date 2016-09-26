import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Streamy} from 'meteor/yuukan:streamy';
import {Clients} from '/common/collections';
import {Rooms} from '/common/collections';
import {ReactiveDict} from 'meteor/reactive-dict';

let nick = new ReactiveVar();
let opponent = new ReactiveVar([]);
let colorChoices = new ReactiveVar([
  {label:'Red', class:'red'},
  {label:'Blue', class:'blue'},
  {label:'Green', class:'green'},
  {label:'Purple', class:'purple'}
]);
let color = new ReactiveVar();
let room = new ReactiveVar('lobby');

// Add a local only collection to manage messages
let Messages = new Mongo.Collection(null);

// -------------------------------------------------------------------------- //
// -------------------------------- Handlers -------------------------------- //
// -------------------------------------------------------------------------- //


// On connected, subscribe to collections
Streamy.onConnect(function () {
  Meteor.subscribe('clients');
  Meteor.subscribe('rooms', Streamy.id());
});

// On disconnect, reset nick name
Streamy.onDisconnect(function () {
  nick.set('');
  Messages.remove({});
});

/**
 *
 */
Streamy.on('nick_ack', function (data) {
  nick.set(data.nick);
});

/**
 * Game Joined!
 *
 */
Streamy.on('__join__', function (data) {

  // Excluding host joining
  if (data.sid === Streamy.id()) {
    return;
  }

  // Only want people joining our current game
  if (data.room === room.get()) {
    var c = Clients.findOne({'sid': data.sid}); // lookup opponent nickname
    if (c && c.nick){
      let opps = opponent.get();
      opps.push(c.nick);
      opponent.set(opps);
    }

    // Emit a message to the newcomer, along with our ID
    Streamy.rooms(room.get()).emit('match__found', {data: {opponent: Streamy.id()}});
  }
});

/**
 * When you've joined a game and have an opponent ID
 */
Streamy.on('match__found', (data)=> {

  // reject our own events
  if (data.data.opponent === Streamy.id()) {
    return false;
  } else {
    if (data.__in === room.get()) {
      var c = Clients.findOne({'sid': data.data.opponent});
      if (c && c.nick) {
        let opps = opponent.get();
        opps.push(c.nick);
        opponent.set(_.uniq(opps));
      }
    }
  }
});


Streamy.on('__cellClick__', (data)=> {
  if (!data) return false;

  let d = data.data;

  let col = color.get();
  if (d.player !== Streamy.id()) {
    col = d.color;
  }

  let cols = colorChoices.get();
  _.each(cols, (c)=>{
    $('.rowCell[data-row=' + d.row + '][data-position=' + d.position + ']').removeClass(c.class);
  });

  $('.rowCell[data-row=' + d.row + '][data-position=' + d.position + ']').addClass(col);

});


// Someone has left
Streamy.on('__leave__', function (data) {
  let opp = opponent.get();
  var c = Clients.findOne({'sid': data.sid});
  let mod = _.without(opp, c.nick)
  opponent.set(mod);
});

Template.App.rendered = function () {
  this.$('.chat__message').focus();
  $(window).resize();
};

Template.App.events({
  'submit .create_or_join': function (evt, tpl) {
    if (evt.preventDefault) evt.preventDefault();

    var $ele = tpl.$('#room__input');
    var val = $ele.val();

    if (!val){
      return;
    }

    let col = $('#colors').find(":selected").val();
    color.set(col)

    // Join the room
    Streamy.join(val.toLowerCase());

    // And switch to it
    room.set(val.toLowerCase());

    $ele.val('');
  },
  'click .rooms__list__joinable': function (evt) {
    room.set(evt.target.innerText.toLowerCase());
  },
  'click .rooms__list__item__leave': function (evt) {
    if (evt.preventDefault) evt.preventDefault();

    var room_name = $(evt.target).prev().text();

    Streamy.leave(room_name);
    Messages.remove({'room': room_name}); // Remove messages from this room
    room.set('lobby');

    return false;
  },
  'mousedown .rowCell': (evt, tpl)=> {
    let node = evt.currentTarget.dataset;

    Streamy.rooms(room.get()).emit('__cellClick__', {
      data: {
        player: Streamy.id(),
        row: node.row,
        position: node.position,
        color: color.get()
      }
    });


  }
});

Template.App.helpers({
  getColors: ()=> {
    return colorChoices.get()
  },
  randomSelect:(col)=>{
    let rand = _.sample(colorChoices.get());
    if(rand.class === col) return true;
  },
  selectedClass: function (room_name) {
    var current_room = room.get();

    return (current_room === room_name.toLowerCase()) && 'rooms__list__item_active';
  },
  rooms: function () {
    return Streamy.rooms();
  },
  isGame: ()=> {
    let current_room = room.get();
    if (current_room && current_room !== 'lobby') {
      return true;
    }
  },
  grid: ()=> {
    let i = _.range(10);
    let rows = [];

    let cellsArr = [];

    _.each(i, (pos)=> {
      cellsArr.push({
        cellID: pos,
        score: 0
      });
    });

    _.each(i, (pos)=> {
      rows.push({
        rowID: pos,
        cells: cellsArr
      })
    });

    return rows;

  }
});

Template.registerHelper('nick', function () {
  return nick.get();
});

Template.registerHelper('opponent', function () {
  if (opponent.get()) {
    return opponent.get();
  } else {
    return '...waiting'
  }

});

Template.registerHelper('roomName', function () {
  return room.get();
});


Template.NickChoice.events({
  'submit': function (evt, tpl) {
    if (evt.preventDefault) evt.preventDefault();

    var val = tpl.$('#nickname').val();

    if (val)
      Streamy.emit('nick_set', {'handle': val});
  }
});