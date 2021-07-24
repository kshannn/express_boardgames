'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('gameListings', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    name: {
      type: 'string',
      length: 45,
      notNull: true
    },
    price: {
      type: 'int',
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    min_player_count: {
      type: 'int',
      notNull: true
    },
    max_player_count: {
      type: 'int',
      notNull: true
    },
    min_age: {
      type: 'int',
      notNull: true
    },
    duration: {
      type: 'int',
      notNull: true
    },
    posted_date: {
      type: 'datetime',
      notNull: true
    },
    published_date: {
      type: 'datetime',
      notNull: true
    },
    designer:{
      type: 'string',
      length: 200,
      notNull: true
    },
    publisher:{
      type: 'string',
      length: 150,
      notNull: true
    },
    stock: {
      type: 'int',
      notNull: true
    },
    image: {
      type: 'string',
      length: 300,
      notNull: true
    },
    vendor_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'gameListing_vendor_fk',
        table: 'vendors',
        mapping: 'id',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        }
      }
    }
  });
};

exports.down = function (db) {
  return db.dropTable('gameListings');
};

exports._meta = {
  "version": 1
};