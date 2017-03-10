import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import * as logic from '../utils/reactive-vars';
import * as sounds from '../utils/sounds';
import { Streamy } from 'meteor/yuukan:streamy';
import { Messages } from '/client/utils/collections';

Template.App.rendered = function() {
  this.$('.chat__message').focus();
  $(window).resize();
};


Template.App.helpers({
  getColors: () => {
    return logic.colorChoices.get()
  },
  randomSelect: ( col ) => {
    let rand = _.sample(logic.colorChoices.get());
    if (rand.class === col) return true;
  },
  selectedClass: function( room_name ) {
    let current_room = logic.room.get();
    
    return (current_room === room_name.toLowerCase()) && 'rooms__list__item_active';
  },
  rooms: function() {
    return Streamy.rooms();
  },
  isGame: () => {
    let current_room = logic.room.get();
    if (current_room && current_room !== 'lobby') {
      return true;
    }
  },

});

Template.App.events({
  'submit .create_or_join': function( evt, tpl ) {
    evt.preventDefault();
    
    let $ele = tpl.$('#room__input');
    let val = $ele.val();
    
    if (!val) {
      return;
    }
    
    let col = $('#colors').find(":selected").val();
    logic.color.set(col)
    
    // Join the room
    Streamy.join(val.toLowerCase());
    
    // And switch to it
    logic.room.set(val.toLowerCase());
    
    $ele.val('');
  },
  'click .rooms__list__joinable': function( evt ) {
    logic.room.set(evt.target.innerText.toLowerCase());
  },
  'click .rooms__list__item__leave': function( evt ) {
    if (evt.preventDefault) evt.preventDefault();
    
    let room_name = $(evt.target).prev().text();
    
    Streamy.leave(room_name);
    Messages.remove({ 'room': room_name }); // Remove messages from this room
    logic.room.set('lobby');
    
    return false;
  },
  'mousedown .rowCell': ( evt, tpl ) => {
    let node = evt.currentTarget.dataset;
    
    console.log(logic.counter.get());
    logic.counter.set(logic.counter.get() + 1);
    if (logic.counter.get() % 4 === 0) {
      sounds.four.play();
    } else {
      sounds.blip.play();
    }
    Streamy.rooms(logic.room.get()).emit('__cellClick__', {
      data: {
        player: Streamy.id(),
        row: node.row,
        position: node.position,
        color: logic.color.get()
      }
    });
  }
});