module.exports = function(app) {
  var path = require('path'),
      filter = require(path.join(__dirname, '../models/Filter.js'));

  function getAttributesTableController(request, response) {

    //console.log(request.body);

    var options = {};
    var order = [];

    if(request.body.satellite !== '') {
      options = {
        satellite: request.body.satellite
      };
    }

    var arrayFound = request.body.columns.filter(function(item) {
      for(var i = 0; i < request.body.order.length; i++) {
        if(item.data === request.body.order[i].column)
          order.push({ "column": item.name, "dir": request.body.order[i].dir });
      }
    });

    filter.getAttributesTablePage(request.body.length, request.body.start, order, request.body.search.value, request.body.dateFrom, request.body.dateTo, options, function(err, result) {
      if(err) return console.error(err);

      filter.getAttributesTableCount(request.body.dateFrom, request.body.dateTo, options, function(err, resultCount) {
        if(err) return console.error(err);

        filter.getAttributesTableCountWithSearch(request.body.dateFrom, request.body.dateTo, request.body.search.value, options, function(err, resultCountWithSearch) {
          if(err) return console.error(err);

          var data = [];

          result.rows.forEach(function(val){
            var temp = [];
            for(var key in val) temp.push(val[key]);
            data.push(temp);
          });

          response.json({
            draw: parseInt(request.body.draw),
            recordsTotal: parseInt(resultCount.rows[0].count),
            recordsFiltered: parseInt(resultCountWithSearch.rows[0].count),
            data: data
          });
        });
      });
    });
  };

  return getAttributesTableController;
};
