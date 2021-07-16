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
  return db.createTable('orders', {
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
    unit_price: {
      type: 'int',
      notNull: true
    },
    game_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'games_transactions_game_fk',
        table: 'games',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    },
    transaction_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'games_transactions_transaction_fk',
        table: 'transactions',
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
  return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
