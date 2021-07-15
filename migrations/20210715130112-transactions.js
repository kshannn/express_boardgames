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
  return db.createTable('transactions',{
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    total_cost: {
      type: 'int',
      notNull: true
    },
    transaction_date: {
      type: 'datetime',
      notNull: true
    },
    user_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'user_transaction_fk',
        table: 'users',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    },
    status_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'transaction_status_fk',
        table: 'statuses',
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
  return db.dropTable('transactions');
};

exports._meta = {
  "version": 1
};
