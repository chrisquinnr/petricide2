import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import * as logic from '/client/utils/reactive-vars';
import * as sounds from '/client/utils/sounds';

Template.game.onCreated(()=>{
  logic.loading.set(true);
})

Template.game.onRendered(()=>{
  Meteor.setTimeout(()=>{
    logic.loading.set(false)
  }, 1000)
})

Template.game.helpers({
  grid: () => {
    let i = _.range(10);
    let rows = [];

    let cellsArr = [];

    _.each(i, ( pos ) => {
      cellsArr.push({
        cellID: pos,
        score: 0
      });
    });

    _.each(i, ( pos ) => {
      rows.push({
        rowID: pos,
        cells: cellsArr
      })
    });

    return rows;

  },
  loading:()=>{
    return logic.loading.get()
  }
});

Template.game.events({
  'mousedown .rowCell': ( evt, tpl ) => {
    evt.preventDefault();
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
})
