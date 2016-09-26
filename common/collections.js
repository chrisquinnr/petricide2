import {Streamy} from 'meteor/yuukan:streamy';
import {Mongo} from 'meteor/mongo';

export var Clients = new Mongo.Collection('clients');
export var Rooms = Streamy.Rooms.model;