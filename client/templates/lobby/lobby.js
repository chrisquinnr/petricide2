import { Template } from 'meteor/templating';
import { Clients } from '/common/collections'
Template.lobby.helpers({
  playersOnline: () => {
    return Clients.find({});
  }
});
