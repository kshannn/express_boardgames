'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return (
    db.insert('categories', ['name'],['Abstract']),
    db.insert('categories', ['name'],['Card']),
    db.insert('categories', ['name'],['Co-op']),
    db.insert('categories', ['name'],['Dexterity']),
    db.insert('categories', ['name'],['Party']),
    db.insert('categories', ['name'],['Trivia']),
    db.insert('categories', ['name'],['Others'])
    )
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
