import { Template } from 'meteor/templating';
import * as logic from '/client/utils/reactive-vars';

Template.registerHelper('nick', ()=> {
  return logic.nick.get();
});

Template.registerHelper('opponent', ()=> {
  if (logic.opponent.get()) {
    return logic.opponent.get();
  } else {
    return '...waiting'
  }

});

Template.registerHelper('isGame', ()=>{
  let current_room = logic.room.get();
  if (current_room && current_room !== 'lobby') {
    return true;
  }
})

Template.registerHelper('roomName', ()=> {
  return logic.room.get();
});
