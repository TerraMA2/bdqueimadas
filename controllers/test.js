module.exports = function(app) {
  var path = require('path'),
      foco = require(path.join(__dirname, '../models/foco.js'));

  function testController(request, response) {

    foco.getPage(request.query.length, request.query.start, '20151210', '20151210', {}, function(err, result) {
      if(err) return console.error(err);

      foco.getPageCount('20151210', '20151210', {}, function(err, resultCount) {
        if(err) return console.error(err);

        var data = [];

        result.rows.forEach(function(val){
          var temp = [];
          for(var key in val) {
            temp.push(val[key]);
          }
          data.push(temp);
        });

        response.json(
          {
            draw: parseInt(request.query.draw),
            recordsTotal: parseInt(resultCount.rows[0].count),
            recordsFiltered: parseInt(resultCount.rows[0].count),
            data: data
          }
        );
      });
    });
  };

  return testController;
};
