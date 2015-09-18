Krypton.Relation.HasMany = Class(Krypton.Relation, 'HasMany').inherits(Krypton.Relation)({
  prototype : {
    fetch : function(records) {
      var relation = this;

      var recordIds = records.map(function(item) {
        return item[relation.ownerCol];
      });

      var query = relation.relatedModel.query();

      return query.whereIn(relation.relatedCol, recordIds)
        .then(function(result) {

          records.forEach(function(record) {
            var asoc = result.filter(function(item) {
              if (item[relation.relatedCol] === record[relation.ownerCol]) {
                return true;
              }
            });

            record[relation.name] = query._createRecordInstances(asoc);
          });

          return records.map(function(item) {
            return item[relation.name]
          });
        });
    }
  }
});

module.exports = Krypton.Relation.HasMany;
