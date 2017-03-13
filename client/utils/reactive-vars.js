import { ReactiveVar } from 'meteor/reactive-var';

export let nick = new ReactiveVar();
export let opponent = new ReactiveVar([]);
export let colorChoices = new ReactiveVar([
  { label: 'Red', class: 'red' },
  { label: 'Blue', class: 'blue' },
  { label: 'Green', class: 'green' },
  { label: 'Purple', class: 'purple' }
]);
export let color = new ReactiveVar();
export let room = new ReactiveVar('lobby');
export let counter = new ReactiveVar(0);
export let loading = new ReactiveVar(false)
