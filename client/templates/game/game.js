import { Template } from 'meteor/templating';

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
  testGroup:()=>{
    
  }
});
