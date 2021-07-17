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
  return db.createTable('categories_gameListings', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    gameListing_id :{
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'gameListing_category_fk',
        table: 'gameListings',
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
        name: 'category_gameListing_fk',
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
  return dropTable('categories_gameListings');
};

exports._meta = {
  "version": 1
};
