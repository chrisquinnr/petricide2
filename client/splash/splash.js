import { Template } from 'meteor/templating';
import { Streamy } from 'meteor/yuukan:streamy';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.splash.events({
  'submit': function( evt, tpl ) {
    if (evt.preventDefault) evt.preventDefault();
    
    let val = tpl.$('#nickname').val();
    
    if (val)
      Streamy.emit('nick_set', { 'handle': val });
  }
});