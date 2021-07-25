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
  return db.createTable('orderItems', {
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
    gameListing_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'orderItem_gameListing_fk',
        table: 'gameListings',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    },
    order_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'orderItem_order_fk',
        table: 'orders',
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
  return db.dropTable('orderItems');
};

exports._meta = {
  "version": 1
};
