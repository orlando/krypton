var Promise = require('bluebird');
var _ = require('lodash');

Krypton.Relation.HasManyThrough = Class(Krypton.Relation, 'HasManyThrough').inherits(Krypton.Relation)({
  prototype : {
    fetch : function(records) {
      var relation = this;

      var promises = _.map(records, function(record) {
        var joinQuery = Krypton.Model.knex().table(relation.ownerModel.tableName);
        var relatedQuery = relation.relatedModel.query();

        joinQuery
          .select(relation.ownerModel.tableName + '.' + relation.ownerCol,
            relation.through.tableName + '.' + relation.through.relatedCol)
          .leftOuterJoin(relation.through.tableName,
            relation.through.tableName + '.' + relation.through.ownerCol,
            relation.ownerModel.tableName + '.' + relation.ownerCol)
          .where(relation.ownerModel.tableName + '.' + relation.ownerCol, '=', record[relation.ownerCol]);

        if (relation.through.scope) {
          joinQuery.andWhere.apply(joinQuery, relation.through.scope);
        }

        joinQuery.then(function(joinResults) {
            var relatedIds = joinResults.map(function(item) {
              return item[relation.joinTableRelatedCol];
            });

            relatedQuery.whereIn(relation.relatedCol, relatedIds)

            if (relation.scope) {
              relatedQuery.andWhere.apply(relatedQuery, relation.scope);
            }
          });

        return joinQuery.then(function() {
          return relatedQuery.then(function(results) {
            record[relation.name] = relatedQuery._createRecordInstances(results);
          });
        })
      });

      return Promise.all(promises).then(function() {
        return _.map(records, function(item) {
          return item[relation.name];
        });
      });
    }
  }
});

module.exports = Krypton.Relation.HasMany;