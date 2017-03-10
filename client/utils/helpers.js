import { Template } from 'meteor/templating';
import * as logic from '/client/utils/reactive-vars';

Template.registerHelper('nick', function() {
  return logic.nick.get();
});

Template.registerHelper('opponent', function() {
  if (logic.opponent.get()) {
    return logic.opponent.get();
  } else {
    return '...waiting'
  }
  
});

Template.registerHelper('roomName', function() {
  return logic.room.get();
});
