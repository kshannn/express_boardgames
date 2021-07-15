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
  return db.createTable('cartItems', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    quantity: {
      type: 'int',
      notNull: true
    },
    total_cost: {
      type: 'int',
      notNull: true
    },
    user_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'user_cartitem_fk',
        table: 'users',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    },
    game_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'game_cartItem_fk',
        table: 'games',
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
  return db.dropTable('cartItems');
};

exports._meta = {
  "version": 1
};
