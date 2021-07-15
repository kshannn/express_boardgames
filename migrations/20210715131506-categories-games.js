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
  return db.createTable('categories_games', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    game_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'game_category_fk',
        table: 'games',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    },
    category_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'category_game_fk',
        table: 'categories',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    }
  });
};

exports.down = function(db) {
  return dropTable('categories_games');
};

exports._meta = {
  "version": 1
};
