var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');

require('./../../');

var IntegrationTestUtils = Module('IntegrationTestUtils')({
  initialize : function(config) {
    var utils = this;

    var knex = require('knex')(config.knexConfig);

    this.knex = knex;

    // Krypton.Model.knex();

    Class('DynamicModel1').inherits(Krypton.Model)({
      tableName : 'Model1',
      attributes : ['id', 'model1Id', 'property1', 'property2', 'property3']
    });

    Class('DynamicModel2').inherits(Krypton.Model)({
      tableName : 'Model2',
      attributes : ['id', 'model1Id', 'property1', 'property2', 'createdAt', 'updatedAt'],
      relations : {
        dynamicModel2Relation1 : {
          type : 'HasManyThrough',
          relatedModel : DynamicModel1,
          ownerCol : 'id',
          relatedCol : 'id',
          through : {
            tableName : 'Model1Model2',
            ownerCol : 'model_2_id',
            relatedCol : 'model_1_id'
          }
        }
      }
    })

    Class('Model1').inherits(Krypton.Model)({
      tableName : 'Model1',
      attributes : ['id', 'model1Id', 'property1', 'property2', 'property3']
    });

    Class('Model2').inherits(Krypton.Model)({
      tableName : 'Model2',
      attributes : ['id', 'model1Id', 'property1', 'property2', 'createdAt', 'updatedAt'],
      relations : {
        model2Relation1 : {
          type : 'HasManyThrough',
          relatedModel : Model1,
          ownerCol : 'id',
          relatedCol : 'id',
          through : {
            tableName : 'Model1Model2',
            ownerCol : 'model_2_id',
            relatedCol : 'model_1_id'
          }
        }
      }
    });



    Model1.knex(knex);
    Model2.knex(knex);

    Model1.relations = {
      model1Relation1 : {
        type : 'HasOne',
        relatedModel : Model1,
        ownerCol : 'model_1_id',
        relatedCol : 'id'
      },
      model1Relation2 : {
        type : 'HasMany',
        relatedModel : Model2,
        ownerCol : 'id',
        relatedCol : 'model_1_id'
      }
    }

    DynamicModel1.relations = {
      dynamicModel1Relation1 : {
        type : 'HasOne',
        relatedModel : DynamicModel1,
        ownerCol : 'model_1_id',
        relatedCol : 'id'
      },
      dynamicModel1Relation2 : {
        type : 'HasMany',
        relatedModel : DynamicModel2,
        ownerCol : 'id',
        relatedCol : 'model_1_id'
      }
    }

    return {
      knex : knex,
      createDB : utils.createDB,
      destroy : utils.destroy
    }
  },

  createDB : function() {
    var utils = this;

    return utils.knex.schema
      .dropTableIfExists('Model1Model2')
      .dropTableIfExists('Model1')
      .dropTableIfExists('Model2')
      .createTable('Model1', function(t) {
        t.increments('id').primary();
        t.integer('model_1_id');
        t.string('property_1');
        t.integer('property_2');
        t.json('property_3');
      })
      .createTable('Model2', function(t) {
        t.increments('id').primary();
        t.integer('model_1_id');
        t.string('property_1');
        t.integer('property_2');
        t.datetime('created_at');
        t.datetime('updated_at');
      })
      .createTable('Model1Model2', function(t) {
        t.increments('id').primary();
        t.integer('model_1_id').notNullable().references('id').inTable('Model1').onDelete('CASCADE');
        t.integer('model_2_id').notNullable().references('id').inTable('Model2').onDelete('CASCADE');
      })
      .catch(function(e) {
        console.log(e)
        throw new Error('Could not connect')
      })
  },

  destroy : function() {
    this.knex.destroy();
  }
});

module.exports = IntegrationTestUtils;
