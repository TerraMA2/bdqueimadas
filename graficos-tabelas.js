$.ajax({
  url: serverConfig.ProxyURL,
  dataType: 'json',
  async: true,
  data: {
    url: serverConfig.URL,
    params: serverConfig.DescribeFeatureTypeParams + filterConfig.LayerToFilter
  },
  success: function(data) {

    featureDescription = data;

    var featuresDescriptionLength = featureDescription.featureTypes[0].properties.length;
    var titles = "";

    for(var i = 0; i < featuresDescriptionLength; i++) {
      if(!strInArr(ignore, featureDescription.featureTypes[0].properties[i].name)) {
        titles += "<th>" + featureDescription.featureTypes[0].properties[i].name + "</th>";
      }
    }

    $.ajax({
      url: serverConfig.ProxyURL,
      dataType: 'json',
      async: true,
      data: {
        url: serverConfig.URL,
        params: serverConfig.GetFeatureParams + filterConfig.LayerToFilter
      },
      success: function(data) {

        features = data;

        var items = "";

        //for(var i = 0; i < features.totalFeatures; i++) {
        for(var i = 0; i < 1000; i++) {
          items += "<tr>";
          for(var j = 0; j < featuresDescriptionLength; j++) {
            if(!strInArr(ignore, featureDescription.featureTypes[0].properties[j].name)) {
              items += "<td>" + features.features[i].properties[featureDescription.featureTypes[0].properties[j].name] + "</td>";
            }
          }
          items += "</tr>";
        }

        $("#table").empty().append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot><tbody>" + items + "</tbody>");

        $('.terrama2-table').DataTable();

        var groupedData = {};
        var groupedDataBioma = {};
        var states = [];
        var biomas = [];

        for(var i = 0; i < 1000; i++) {
          var itemUf = features.features[i].properties.Uf;
          var itemBioma = features.features[i].properties.Bioma;

          if(strInArr(states, itemUf)) {
            groupedData[itemUf]++;
          } else {
            groupedData[itemUf] = 1;
            states.push(itemUf);
          }

          if(strInArr(biomas, itemBioma)) {
            groupedDataBioma[itemBioma]++;
          } else {
            groupedDataBioma[itemBioma] = 1;
            biomas.push(itemBioma);
          }
        }

        groupedData = SortArr(groupedData);
        groupedDataBioma = SortArr(groupedDataBioma);

        var labels = [];
        var values = [];

        var labelsB = [];
        var valuesB = [];

        var groupedDataLength = groupedData.length;
        var groupedDataBiomaLength = groupedDataBioma.length;

        for(var i = 0; i < groupedDataLength; i++) {
          labels.push(groupedData[i].key);
          values.push(groupedData[i].val);
        }

        for(var i = 0; i < groupedDataBiomaLength; i++) {
          labelsB.push(groupedDataBioma[i].key);
          valuesB.push(groupedDataBioma[i].val);
        }

        var barChartData = {
          labels : labels,
          datasets : [
            {
              fillColor : "rgba(151,187,205,0.5)",
              strokeColor : "rgba(151,187,205,0.8)",
              highlightFill : "rgba(151,187,205,0.75)",
              highlightStroke : "rgba(151,187,205,1)",
              data : values
            }
          ]
        }

        var pieData = [
          {
            value: valuesB[0], color:"#F7464A", highlight: "#FF5A5E", label: labelsB[0]
          }, {
            value: valuesB[1], color: "#46BFBD", highlight: "#5AD3D1", label: labelsB[1]
          }, {
            value: valuesB[2], color: "#FDB45C", highlight: "#FFC870", label: labelsB[2]
          }, {
            value: valuesB[3], color: "#949FB1", highlight: "#A8B3C5", label: labelsB[3]
          }, {
            value: valuesB[4], color: "#4D5360", highlight: "#616774", label: labelsB[4]
          }
        ];

        var ctxBar = document.getElementById("canvas").getContext("2d");
        var ctxPie = document.getElementById("chart-area").getContext("2d");

        window.myBar = new Chart(ctxBar).Bar(barChartData, { responsive : true, maintainAspectRatio: false });
        window.myPie = new Chart(ctxPie).Pie(pieData, { responsive : true, maintainAspectRatio: false });

        $("#graphic-left").on('click', function() {
          $("#graphic-left").addClass("terrama2-span-active");
          $("#graphic-right").removeClass("terrama2-span-active");

          $("#canvas").css("display", "");
          $("#chart-area").css("display", "none");
        });

        $("#graphic-right").on('click', function() {
          $("#graphic-right").addClass("terrama2-span-active");
          $("#graphic-left").removeClass("terrama2-span-active");

          $("#canvas").css("display", "none");
          $("#chart-area").css("display", "");
        });
      }
    });
  }
});

var filterConfig = terrama2.getConfig().getConfJsonFilter();
var serverConfig = terrama2.getConfig().getConfJsonServer();

var elem = "";
var features = {};
var featureDescription = {};

var ignore = ['the_geom', 'Id'];

var strInArr = function(arr, str) {
  for(i = 0, j = arr.length; i < j; i++) {
    if(arr[i] === str) {
      return true;
    }
  }
  return false;
}

var SortArr = function (j) {
  var arr = [];
  for (var key in j) {
    arr.push({ key: key, val: j[key] });
  }
  arr.sort(function (a, b) {
    var intA = parseInt(a.val), intB = parseInt(b.val);
    if (intA > intB) return -1;
    if (intA < intB) return 1;
    return 0;
  });
  return arr;
};
