"use strict";

/**
 * Filter class of the BDQueimadas.
 * @class Filter
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {date} memberDateFrom - Current initial date.
 * @property {date} memberDateTo - Current final date.
 * @property {string} memberTimeFrom - Current initial time.
 * @property {string} memberTimeTo - Current final time.
 * @property {array} memberSatellites - Current satellites.
 * @property {array} memberBiomes - Current biomes.
 * @property {string} memberContinent - Current continent.
 * @property {array} memberCountries - Current countries.
 * @property {array} memberStates - Current states.
 * @property {string} memberCity - Current city.
 * @property {array} memberSpecialRegions - Current special regions.
 * @property {array} memberSpecialRegionsCountries - Current special regions countries.
 * @property {array} memberSpecialRegionsStates - Current special regions states.
 * @property {array} memberSpecialRegionsCities - Current special regions cities.
 * @property {object} memberProtectedArea - Current protected area.
 */
define(
  ['components/Utils', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Map, TerraMA2WebComponents) {

    // Current initial date
    var memberDateFrom = null;
    // Current final date
    var memberDateTo = null;
    // Current initial time
    var memberTimeFrom = null;
    // Current final time
    var memberTimeTo = null;
    // Current satellites
    var memberSatellites = ["all"];
    // Current biomes
    var memberBiomes = ["all"];
    // Current continent
    var memberContinent = null;
    // Current countries
    var memberCountries = [];
    // Current states
    var memberStates = [];
    // Current city
    var memberCity = null;
    // Current special regions
    var memberSpecialRegions = [];
    // Current special regions countries
    var memberSpecialRegionsCountries = [];
    // Current special regions states
    var memberSpecialRegionsStates = [];
    // Current special regions cities
    var memberSpecialRegionsCities = [];
    // Current protected area
    var memberProtectedArea = null;

    /**
     * Returns the initial date formatted with the received format.
     * @param {string} format - Format
     * @returns {string} Utils.dateToString() - Formatted initial date (string)
     *
     * @function getFormattedDateFrom
     * @memberof Filter(2)
     * @inner
     */
    var getFormattedDateFrom = function(format) {
      return Utils.dateToString(memberDateFrom, format);
    };

    /**
     * Returns the final date formatted with the received format.
     * @param {string} format - Format
     * @returns {string} Utils.dateToString() - Formatted final date (string)
     *
     * @function getFormattedDateTo
     * @memberof Filter(2)
     * @inner
     */
    var getFormattedDateTo = function(format) {
      return Utils.dateToString(memberDateTo, format);
    };

    /**
     * Returns the initial time.
     * @returns {string} memberTimeFrom - Initial time
     *
     * @function getTimeFrom
     * @memberof Filter(2)
     * @inner
     */
    var getTimeFrom = function() {
      return memberTimeFrom;
    };

    /**
     * Returns the final time.
     * @returns {string} memberTimeTo - Final time
     *
     * @function getTimeTo
     * @memberof Filter(2)
     * @inner
     */
    var getTimeTo = function() {
      return memberTimeTo;
    };

    /**
     * Sets the satellites array.
     * @param {array} satellites - Satellites array
     *
     * @function setSatellites
     * @memberof Filter(2)
     * @inner
     */
    var setSatellites = function(satellites) {
      memberSatellites = satellites;
    };

    /**
     * Returns the satellites array.
     * @returns {array} memberSatellites - Satellites array
     *
     * @function getSatellites
     * @memberof Filter(2)
     * @inner
     */
    var getSatellites = function() {
      return memberSatellites;
    };

    /**
     * Sets the biomes array.
     * @param {array} biomes - Biomes array
     *
     * @function setBiomes
     * @memberof Filter(2)
     * @inner
     */
    var setBiomes = function(biomes) {
      memberBiomes = biomes;
    };

    /**
     * Returns the biomes array.
     * @returns {array} memberBiomes - Biomes array
     *
     * @function getBiomes
     * @memberof Filter(2)
     * @inner
     */
    var getBiomes = function() {
      return memberBiomes;
    };

    /**
     * Sets the continent.
     * @param {string} continent - Continent
     *
     * @function setContinent
     * @memberof Filter(2)
     * @inner
     */
    var setContinent = function(continent) {
      memberContinent = continent;
    };

    /**
     * Returns the continent.
     * @returns {string} memberContinent - Continent
     *
     * @function getContinent
     * @memberof Filter(2)
     * @inner
     */
    var getContinent = function() {
      return memberContinent;
    };

    /**
     * Sets the countries array.
     * @param {array} countries - Countries array
     *
     * @function setCountries
     * @memberof Filter(2)
     * @inner
     */
    var setCountries = function(countries) {
      memberCountries = countries;
    };

    /**
     * Returns the countries array.
     * @returns {array} memberCountries - Countries array
     *
     * @function getCountries
     * @memberof Filter(2)
     * @inner
     */
    var getCountries = function() {
      return memberCountries;
    };

    /**
     * Clears the list of selected countries.
     *
     * @function clearCountries
     * @memberof Filter(2)
     * @inner
     */
    var clearCountries = function() {
      setCountries([]);
      $("#countries option:selected").removeAttr("selected");
    };

    /**
     * Sets the states array.
     * @param {array} states - States array
     *
     * @function setStates
     * @memberof Filter(2)
     * @inner
     */
    var setStates = function(states) {
      memberStates = states;
    };

    /**
     * Returns the states array.
     * @returns {array} memberStates - States array
     *
     * @function getStates
     * @memberof Filter(2)
     * @inner
     */
    var getStates = function() {
      return memberStates;
    };

    /**
     * Sets the city.
     * @param {string} city - City
     *
     * @function setCity
     * @memberof Filter(2)
     * @inner
     */
    var setCity = function(city) {
      memberCity = city;
    };

    /**
     * Returns the city.
     * @returns {string} memberCity - City
     *
     * @function getCity
     * @memberof Filter(2)
     * @inner
     */
    var getCity = function() {
      return memberCity;
    };

    /**
     * Clears the list of selected states.
     *
     * @function clearStates
     * @memberof Filter(2)
     * @inner
     */
    var clearStates = function() {
      setStates([]);
      $("#states option:selected[value!='0']").removeAttr("selected");
    };

    /**
     * Clears the list of selected special regions.
     *
     * @function clearSpecialRegions
     * @memberof Filter(2)
     * @inner
     */
    var clearSpecialRegions = function() {
      setSpecialRegions([]);
    };

    /**
     * Sets the special regions array.
     * @param {array} specialRegions - Special regions array
     *
     * @function setSpecialRegions
     * @memberof Filter(2)
     * @inner
     */
    var setSpecialRegions = function(specialRegions) {
      memberSpecialRegions = specialRegions;
    };

    /**
     * Returns the special regions array.
     * @returns {array} memberSpecialRegions - Special regions array
     *
     * @function getSpecialRegions
     * @memberof Filter(2)
     * @inner
     */
    var getSpecialRegions = function() {
      return memberSpecialRegions;
    };

    /**
     * Returns the special regions countries array.
     * @returns {array} memberSpecialRegionsCountries - Special regions countries
     *
     * @function getSpecialRegionsCountries
     * @memberof Filter(2)
     * @inner
     */
    var getSpecialRegionsCountries = function() {
      return memberSpecialRegionsCountries;
    };

    /**
     * Returns the special regions states array.
     * @returns {array} memberSpecialRegionsStates - Special regions states
     *
     * @function getSpecialRegionsStates
     * @memberof Filter(2)
     * @inner
     */
    var getSpecialRegionsStates = function() {
      return memberSpecialRegionsStates;
    };

    /**
     * Returns the special regions cities array.
     * @returns {array} memberSpecialRegionsCities - Special regions cities
     *
     * @function getSpecialRegionsCities
     * @memberof Filter(2)
     * @inner
     */
    var getSpecialRegionsCities = function() {
      return memberSpecialRegionsCities;
    };

    /**
     * Sets the id of the current protected area.
     * @param {object} protectedArea - Id of the protected area
     *
     * @function setProtectedArea
     * @memberof Filter(2)
     * @inner
     */
    var setProtectedArea = function(protectedArea) {
      memberProtectedArea = protectedArea;
    };

    /**
     * Returns the id fo the current protected area.
     * @returns {object} memberProtectedArea - Current protected area
     *
     * @function getProtectedArea
     * @memberof Filter(2)
     * @inner
     */
    var getProtectedArea = function() {
      return memberProtectedArea;
    };

    /**
     * Creates the date / time filter.
     * @returns {string} cql - Date / time cql filter
     *
     * @private
     * @function createDateTimeFilter
     * @memberof Filter(2)
     * @inner
     */
    var createDateTimeFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.DateTimeFieldName + " between " + Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat) + 'T' + memberTimeFrom;
      cql += " and ";
      cql += Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat) + 'T' + memberTimeTo;

      return cql;
    };

    /**
     * Updates the initial and the final date.
     * @param {string} newDateFrom - New initial date (string)
     * @param {string} newDateTo - New final date (string)
     * @param {string} format - Dates format
     *
     * @function updateDates
     * @memberof Filter(2)
     * @inner
     */
    var updateDates = function(newDateFrom, newDateTo, format) {
      memberDateFrom = Utils.stringToDate(newDateFrom, format);
      memberDateTo = Utils.stringToDate(newDateTo, format);

      memberDateFrom.setHours(0,0,0,0);
      memberDateTo.setHours(0,0,0,0);

      $('#filter-date-from').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));
    };

    /**
     * Updates the initial and the final times.
     * @param {string} newTimeFrom - New initial time
     * @param {string} newTimeTo - New final time
     *
     * @function updateTimes
     * @memberof Filter(2)
     * @inner
     */
    var updateTimes = function(newTimeFrom, newTimeTo) {
      memberTimeFrom = newTimeFrom;
      memberTimeTo = newTimeTo;

      $('#filter-time-from').val(memberTimeFrom);
      $('#filter-time-to').val(memberTimeTo);
    };

    /**
     * Updates the initial and the final date to the current date.
     *
     * @function updateDatesToCurrent
     * @memberof Filter(2)
     * @inner
     */
    var updateDatesToCurrent = function() {
      memberDateFrom = new Date();
      memberDateTo = new Date();
      memberDateFrom.setHours(memberDateFrom.getHours() - 24);

      memberDateFrom.setHours(0,0,0,0);
      memberDateTo.setHours(0,0,0,0);

      $('#filter-date-from').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));

      $('#filter-date-from-attributes-table').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to-attributes-table').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));

      $('#filter-date-from-graphics').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to-graphics').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));
    };

    /**
     * Updates the initial and the final times to the default times.
     *
     * @function updateTimesToDefault
     * @memberof Filter(2)
     * @inner
     */
    var updateTimesToDefault = function() {
      memberTimeFrom = '00:00';
      memberTimeTo = '23:59';

      $('#filter-time-from').val(memberTimeFrom);
      $('#filter-time-to').val(memberTimeTo);

      $('#filter-time-from-attributes-table').val(memberTimeFrom);
      $('#filter-time-to-attributes-table').val(memberTimeTo);

      $('#filter-time-from-graphics').val(memberTimeFrom);
      $('#filter-time-to-graphics').val(memberTimeTo);
    };

    /**
     * Creates the satellites filter.
     * @returns {string} cql - Satellites cql filter
     *
     * @private
     * @function createSatellitesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createSatellitesFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName + " in (";

      for(var i = 0; i < memberSatellites.length; i++) {
        cql += "'" + memberSatellites[i] + "',";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the biomes filter.
     * @returns {string} cql - Biomes cql filter
     *
     * @private
     * @function createBiomesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createBiomesFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.BiomeFieldName + " in (";

      for(var i = 0; i < memberBiomes.length; i++) {
        cql += "'" + memberBiomes[i] + "',";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the countries filter.
     * @returns {string} cql - Countries cql filter
     *
     * @private
     * @function createCountriesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createCountriesFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName + " in (";

      if(!Utils.stringInArray(memberCountries, "")) {
        for(var i = 0; i < memberCountries.length; i++) {
          cql += memberCountries[i] + ",";
        }
      }

      for(var i = 0; i < memberSpecialRegionsCountries.length; i++) {
        cql += memberSpecialRegionsCountries[i] + ",";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the continent filter, valid only for the initial continent.
     * @returns {string} cql - Countries cql filter
     *
     * @private
     * @function createContinentFilter
     * @memberof Filter(2)
     * @inner
     */
    var createContinentFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName + " in (";

      var countries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
      var countriesLength = countries.length;

      for(var i = 0; i < countriesLength; i++) {
        cql += countries[i] + ",";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the states filter.
     * @returns {string} cql - States cql filter
     *
     * @private
     * @function createStatesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createStatesFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName + " in (";

      if(!Utils.stringInArray(memberStates, "")) {
        for(var i = 0; i < memberStates.length; i++) {
          cql += "'" + memberStates[i] + "',";
        }
      }

      for(var i = 0; i < memberSpecialRegionsStates.length; i++) {
        cql += "'" + memberSpecialRegionsStates[i] + "',";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the cities filter.
     * @returns {string} cql - States cql filter
     *
     * @private
     * @function createCitiesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createCitiesFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.CityFieldName + " in (";

      for(var i = 0; i < memberSpecialRegionsCities.length; i++) {
        cql += "'" + memberSpecialRegionsCities[i] + "',";
      }

      if(memberCity !== null) {
        cql += "'" + memberCity + "')";
      } else {
        cql = cql.substring(0, cql.length - 1) + ")";
      }

      return cql;
    };

    /**
     * Applies the dates, the satellites and the biomes filters.
     *
     * @function applyFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyFilter = function() {
      var dates = Utils.getFilterDates(true, 0);
      var times = Utils.getFilterTimes(true, 0);

      if(dates !== null && times !== null) {
        if(dates.length === 0) {
          updateDatesToCurrent();
          var filterDateFrom = getFormattedDateFrom('YYYY/MM/DD');
          var filterDateTo = getFormattedDateTo('YYYY/MM/DD');
        } else {
          var filterDateFrom = dates[0];
          var filterDateTo = dates[1];
        }

        if(times.length === 0) {
          updateTimesToDefault();
          var filterTimeFrom = '00:00';
          var filterTimeTo = '23:59';
        } else {
          var filterTimeFrom = times[0];
          var filterTimeTo = times[1];
        }

        $('#filter-date-from-attributes-table').val(filterDateFrom);
        $('#filter-date-to-attributes-table').val(filterDateTo);

        $('#filter-date-from-graphics').val(filterDateFrom);
        $('#filter-date-to-graphics').val(filterDateTo);

        $('#filter-time-from-attributes-table').val(filterTimeFrom);
        $('#filter-time-to-attributes-table').val(filterTimeTo);

        $('#filter-time-from-graphics').val(filterTimeFrom);
        $('#filter-time-to-graphics').val(filterTimeTo);

        setSatellites($('#filter-satellite').val());

        $('#filter-satellite-attributes-table').val($('#filter-satellite').val());
        $('#filter-satellite-graphics').val($('#filter-satellite').val());

        setBiomes($('#filter-biome').val());

        $('#filter-biome-attributes-table').val($('#filter-biome').val());
        $('#filter-biome-graphics').val($('#filter-biome').val());

        var cql = "";

        var specialRegionsData = createSpecialRegionsArrays(memberSpecialRegions);

        memberSpecialRegionsCountries = specialRegionsData.specialRegionsCountries;
        memberSpecialRegionsStates = specialRegionsData.specialRegionsStates;
        memberSpecialRegionsCities = specialRegionsData.specialRegionsCities;

        if(filterDateFrom.length > 0 && filterDateTo.length > 0 && filterTimeFrom.length > 0 && filterTimeTo.length > 0) {
          updateDates(filterDateFrom, filterDateTo, 'YYYY/MM/DD');
          updateTimes(filterTimeFrom, filterTimeTo);

          cql += createDateTimeFilter() + " AND ";

          if(Map.getLayers().length > 0) processLayers(Map.getLayers());
        }

        if(!Utils.stringInArray(memberSatellites, "all")) {
          cql += createSatellitesFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberBiomes, "all")) {
          cql += createBiomesFilter() + " AND ";
        }

        if((memberContinent !== null && memberContinent == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter) && (Utils.stringInArray(memberCountries, "") || memberCountries.length === 0)) {
          cql += createContinentFilter() + " AND ";
        }

        if((!Utils.stringInArray(memberCountries, "") && memberCountries.length > 0) || memberSpecialRegionsCountries.length > 0) {
          cql += createCountriesFilter() + " AND ";
        }

        if((!Utils.stringInArray(memberStates, "") && memberStates.length > 0) || memberSpecialRegionsStates.length > 0) {
          cql += createStatesFilter() + " AND ";
        }

        if(memberSpecialRegionsCities.length > 0 || memberCity !== null) {
          cql += createCitiesFilter() + " AND ";
        }

        if(cql.length > 5) {
          cql = cql.substring(0, cql.length - 5);
        }

        updateSatellitesSelect();
        TerraMA2WebComponents.MapDisplay.applyCQLFilter(cql, Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId);
      }

      if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
    };

    /**
     * Processes an array of special regions and returns an object of arrays of countries, states and cities.
     * @param {array} specialRegions - Special regions array
     *
     * @function createSpecialRegionsArrays
     * @memberof Filter(2)
     * @inner
     */
    var createSpecialRegionsArrays = function(specialRegions) {
      var specialRegionsData = {
        specialRegionsCountries: [],
        specialRegionsStates: [],
        specialRegionsCities: []
      };

      if(specialRegions.length > 0) {
        for(var i = 0; i < specialRegions.length; i++) {
          for(var j = 0; j < Utils.getConfigurations().filterConfigurations.SpecialRegions.length; j++) {
            if(specialRegions[i] == Utils.getConfigurations().filterConfigurations.SpecialRegions[j].Id) {
              for(var x = 0; x < Utils.getConfigurations().filterConfigurations.SpecialRegions[j].Countries.length; x++)
                specialRegionsData.specialRegionsCountries.push(Utils.getConfigurations().filterConfigurations.SpecialRegions[j].Countries[x]);

              for(var x = 0; x < Utils.getConfigurations().filterConfigurations.SpecialRegions[j].States.length; x++)
                specialRegionsData.specialRegionsStates.push(Utils.getConfigurations().filterConfigurations.SpecialRegions[j].States[x]);

              for(var x = 0; x < Utils.getConfigurations().filterConfigurations.SpecialRegions[j].Cities.length; x++)
                specialRegionsData.specialRegionsCities.push(Utils.getConfigurations().filterConfigurations.SpecialRegions[j].Cities[x]);

              break;
            }
          }
        }
      }

      return specialRegionsData;
    };

    /**
     * Checks the number of fires for the current filters.
     *
     * @function checkFiresCount
     * @memberof Filter(2)
     * @inner
     */
    var checkFiresCount = function() {
      if($('#loading-span').hasClass('hide')) $('#loading-span').removeClass('hide');

      var dates = Utils.getFilterDates(true, 0);

      var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
      var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
      var satellites = Utils.stringInArray(getSatellites(), "all") ? '' : getSatellites().toString();
      var biomes = Utils.stringInArray(getBiomes(), "all") ? '' : getBiomes().toString();
      var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();
      var countries = (Utils.stringInArray(getCountries(), "") || getCountries().length === 0 ? '' : getCountries().toString());
      var states = (Utils.stringInArray(getStates(), "") || getStates().length === 0 ? '' : getStates().toString());

      if((memberContinent !== null && memberContinent == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter) && countries === '') {
        var initialContinentCountries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
        var initialContinentCountriesLength = initialContinentCountries.length;

        for(var i = 0; i < initialContinentCountriesLength; i++) {
          countries += initialContinentCountries[i] + ',';
        }

        countries = countries.substring(0, countries.length - 1);
      }

      Utils.getSocket().emit('checkFiresCountRequest', {
        dateFrom: dateFrom,
        dateTo: dateTo,
        satellites: satellites,
        biomes: biomes,
        extent: extent,
        countries: countries,
        states: states
      });
    };

    /**
     * Processes a list of layers and applies filters to the layers that should be filtered.
     * @param {array} layers - Layers array
     *
     * @private
     * @function processLayers
     * @memberof Filter(2)
     * @inner
     */
    var processLayers = function(layers) {
      $.each(layers, function(j, layer) {
        if(layer.Params.Time !== undefined && layer.Params.Time !== null) {
          Map.updateLayerTime(layer);
        }

        if(layer.Id === Utils.getConfigurations().filterConfigurations.CountriesLayer.Id) {
          if(memberContinent !== null) {
            var cqlFilter = Utils.getConfigurations().filterConfigurations.CountriesLayer.ContinentField + "=" + memberContinent;
            TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
          }
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.CountriesLabelsLayer.Id) {
          if(memberContinent !== null) {
            var cqlFilter = Utils.getConfigurations().filterConfigurations.CountriesLabelsLayer.ContinentField + "=" + memberContinent;
            TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
          }
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.StatesLayer.Id) {
          var cqlFilter = Utils.getConfigurations().filterConfigurations.StatesLayer.CountryField + " in (";

          if(memberCountries.length > 0 || memberSpecialRegionsCountries.length > 0) {
            for(var count = 0; count < memberCountries.length; count++) {
              cqlFilter += memberCountries[count] + ",";
            }

            for(var count = 0; count < memberSpecialRegionsCountries.length; count++) {
              cqlFilter += memberSpecialRegionsCountries[count] + ",";
            }

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
          } else {
            cqlFilter += "0)";
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.StatesLabelsLayer.Id) {
          var cqlFilter = Utils.getConfigurations().filterConfigurations.StatesLabelsLayer.CountryField + " in (";

          if(memberCountries.length > 0 || memberSpecialRegionsCountries.length > 0) {
            for(var count = 0; count < memberCountries.length; count++) {
              cqlFilter += memberCountries[count] + ",";
            }

            for(var count = 0; count < memberSpecialRegionsCountries.length; count++) {
              cqlFilter += memberSpecialRegionsCountries[count] + ",";
            }

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
          } else {
            cqlFilter += "0)";
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id) {
          var cqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLayer.CountryField + " in (";

          if($('#states').val() !== null) {
            var states = $('#states').val();
            var index = states.indexOf("0");
          } else {
            var index = -1;
          }

          if(index > -1) {
            if(memberCountries.length > 0) {
              for(var count = 0; count < memberCountries.length; count++) cqlFilter += memberCountries[count] + ",";

              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          } else {
            if(memberStates.length > 0 || memberSpecialRegionsStates.length > 0) {
              var statesCqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLayer.StateField + " in (";
              var citiesCqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLayer.CityField + " in (";

              for(var count = 0; count < memberStates.length; count++) {
                var ids = Utils.getStateIds(memberStates[count]);
                cqlFilter += ids[0] + ",";
                statesCqlFilter += "'" + memberStates[count] + "',";
              }

              for(var count = 0; count < memberSpecialRegionsCountries.length; count++)
                cqlFilter += memberSpecialRegionsCountries[count] + ",";

              for(var count = 0; count < memberSpecialRegionsStates.length; count++)
                statesCqlFilter += "'" + memberSpecialRegionsStates[count] + "',";

              for(var count = 0; count < memberSpecialRegionsCities.length; count++)
                citiesCqlFilter += "'" + memberSpecialRegionsCities[count] + "',";

              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ") AND " + statesCqlFilter.substring(0, (statesCqlFilter.length - 1)) + ")";

              if(memberSpecialRegionsCities.length > 0) cqlFilter += " AND " + citiesCqlFilter.substring(0, (citiesCqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.Id) {
          var cqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CountryField + " in (";

          if($('#states').val() !== null) {
            var states = $('#states').val();
            var index = states.indexOf("0");
          } else {
            var index = -1;
          }

          if(index > -1) {
            if(memberCountries.length > 0) {
              for(var count = 0; count < memberCountries.length; count++) {
                cqlFilter += memberCountries[count] + ",";
              }

              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          } else {
            if(memberStates.length > 0 || memberSpecialRegionsStates.length > 0) {
              var statesCqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.StateField + " in (";
              var citiesCqlFilter = Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CityField + " in (";

              for(var count = 0; count < memberStates.length; count++) {
                var ids = Utils.getStateIds(memberStates[count]);
                cqlFilter += ids[0] + ",";
                statesCqlFilter += "'" + memberStates[count] + "',";
              }

              for(var count = 0; count < memberSpecialRegionsCountries.length; count++)
                cqlFilter += memberSpecialRegionsCountries[count] + ",";

              for(var count = 0; count < memberSpecialRegionsStates.length; count++)
                statesCqlFilter += "'" + memberSpecialRegionsStates[count] + "',";

              for(var count = 0; count < memberSpecialRegionsCities.length; count++)
                citiesCqlFilter += "'" + memberSpecialRegionsCities[count] + "',";

              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ") AND " + statesCqlFilter.substring(0, (statesCqlFilter.length - 1)) + ")";

              if(memberSpecialRegionsCities.length > 0) cqlFilter += " AND " + citiesCqlFilter.substring(0, (citiesCqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(Utils.stringInArray(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, layer.Id)) {
          var countries = $('#countries').val();

          if(memberContinent !== null && countries !== null && memberContinent == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter && (Utils.stringInArray(countries, "") || countries.length === 0)) {
            var initialContinentCountries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
            var initialContinentCountriesLength = initialContinentCountries.length;

            countries = [];

            for(var i = 0; i < initialContinentCountriesLength; i++) countries.push(initialContinentCountries[i]);
          }

          applyCurrentSituationFilter(
            Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeFrom,
            Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeTo,
            countries,
            memberStates,
            memberSatellites,
            memberBiomes,
            layer.Id
          );
        }
      });
    };

    /**
     * Applies filters to the current situation layers.
     * @param {int} begin - Initial date / time
     * @param {int} end - Final date / time
     * @param {array} countries - Countries ids
     * @param {array} states - States ids
     * @param {array} satellites - Satellites
     * @param {array} biomes - Biomes
     * @param {string} layer - Layer id
     *
     * @function applyCurrentSituationFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyCurrentSituationFilter = function(begin, end, countries, states, satellites, biomes, layer) {
      var currentSituationFilter = "begin:" + begin + ";end:" + end;

      if(countries !== undefined && countries !== null && countries !== "" && countries !== '' && countries !== [] && !Utils.stringInArray(countries, "")) {
        currentSituationFilter += ";countries:" + Utils.replaceAll(countries.toString(), ',', '\\,');
      }

      if(states !== undefined && states !== null && states !== "" && states !== '' && states !== [] && !Utils.stringInArray(states, "")) {
        currentSituationFilter += ";states:'" + Utils.replaceAll(states.toString(), ',', '\'\\,\'') + "'";
      }

      if(satellites !== undefined && satellites !== null && satellites !== "" && satellites !== '' && satellites !== [] && !Utils.stringInArray(satellites, "all")) {
        currentSituationFilter += ";satellites:'" + Utils.replaceAll(satellites.toString(), ',', '\'\\,\'') + "'";
      }

      if(biomes !== undefined && biomes !== null && biomes !== "" && biomes !== '' && biomes !== [] && !Utils.stringInArray(biomes, "all")) {
        currentSituationFilter += ";biomes:'" + Utils.replaceAll(biomes.toString(), ',', '\'\\,\'') + "'";
      }

      TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer, { viewparams: currentSituationFilter }, false);
    };

    /**
     * Updates the satellites HTML select.
     *
     * @private
     * @function updateSatellitesSelect
     * @memberof Filter(2)
     * @inner
     */
    var updateSatellitesSelect = function() {
      var selectedOptions = $('#filter-satellite').val();

      var allOption = Utils.stringInArray(selectedOptions, "all") ? "<option value=\"all\" selected>TODOS</option>" : "<option value=\"all\">TODOS</option>";
      var referenceSatellite = "";
      var elem = "";
      var satellitesList = Utils.getConfigurations().filterConfigurations.Satellites;

      $.each(satellitesList, function(i, satelliteItem) {
        var satelliteBegin = new Date();
        var satelliteEnd = new Date();

        var satelliteReferenceBegin = new Date();
        var satelliteReferenceEnd = new Date();

        if(satelliteItem.Begin !== "") {
          var satelliteBeginArray = satelliteItem.Begin.split('-');
          satelliteBegin = new Date(parseInt(satelliteBeginArray[0]), parseInt(satelliteBeginArray[1]) - 1, parseInt(satelliteBeginArray[2]), 0, 0, 0);
        }

        if(satelliteItem.End !== "") {
          var satelliteEndArray = satelliteItem.End.split('-');
          satelliteEnd = new Date(parseInt(satelliteEndArray[0]), parseInt(satelliteEndArray[1]) - 1, parseInt(satelliteEndArray[2]), 0, 0, 0);
        }

        if(satelliteItem.ReferenceBegin !== "") {
          var satelliteReferenceBeginArray = satelliteItem.ReferenceBegin.split('-');
          satelliteReferenceBegin = new Date(parseInt(satelliteReferenceBeginArray[0]), parseInt(satelliteReferenceBeginArray[1]) - 1, parseInt(satelliteReferenceBeginArray[2]), 0, 0, 0);
        }

        if(satelliteItem.ReferenceEnd !== "") {
          var satelliteReferenceEndArray = satelliteItem.ReferenceEnd.split('-');
          satelliteReferenceEnd = new Date(parseInt(satelliteReferenceEndArray[0]), parseInt(satelliteReferenceEndArray[1]) - 1, parseInt(satelliteReferenceEndArray[2]), 0, 0, 0);
        }

        if((satelliteBegin <= memberDateFrom && satelliteEnd >= memberDateTo) || (satelliteBegin <= memberDateFrom && satelliteItem.Current)) {
          if((satelliteReferenceBegin <= memberDateFrom && satelliteReferenceEnd >= memberDateTo) || (satelliteReferenceBegin <= memberDateFrom && satelliteItem.ReferenceCurrent)) {
            if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
              referenceSatellite += "<option value=\"" + satelliteItem.Id + "\" selected>Refer. (" + satelliteItem.Name + ")</option>";
            } else {
              referenceSatellite += "<option value=\"" + satelliteItem.Id + "\">Refer. (" + satelliteItem.Name + ")</option>";
            }
          } else {
            if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
              elem += "<option value=\"" + satelliteItem.Id + "\" selected>" + satelliteItem.Name + "</option>";
            } else {
              elem += "<option value=\"" + satelliteItem.Id + "\">" + satelliteItem.Name + "</option>";
            }
          }
        } else if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
          elem += "<option value=\"" + satelliteItem.Id + "\" selected>" + satelliteItem.Name + "</option>";
        }
      });

      $('#filter-satellite').empty().html(allOption + referenceSatellite + elem);
    };

    /**
     * Selects a continent in the continent dropdown and fills the countries dropdown.
     * @param {string} id - Continent id
     * @param {string} text - Continent name
     *
     * @function selectContinentItem
     * @memberof Filter(2)
     * @inner
     */
    var selectContinentItem = function(id, text) {
      Utils.getSocket().emit('spatialFilterRequest', { ids: id, key: 'Continent', filterForm: false });
    };

    /**
     * Selects a list of countries in the countries dropdown, selects a continent in the continent dropdown and fills the states dropdown.
     * @param {array} ids - Countries ids
     *
     * @function selectCountries
     * @memberof Filter(2)
     * @inner
     */
    var selectCountries = function(ids) {
      Utils.getSocket().emit('continentByCountryRequest', { country: ids[0] });
      Utils.getSocket().emit('spatialFilterRequest', { ids: ids, key: 'Countries', filterForm: false });
    };

    /**
     * Selects a list of states in the states dropdown, selects a continent in the continent dropdown and selects a list of countries in the countries dropdown.
     * @param {array} ids - States ids
     *
     * @function selectStates
     * @memberof Filter(2)
     * @inner
     */
    var selectStates = function(ids) {
      Utils.getSocket().emit('continentByStateRequest', { state: ids[0] });
      Utils.getSocket().emit('countriesByStatesRequest', { states: ids });
      Utils.getSocket().emit('spatialFilterRequest', { ids: ids, specialRegions: [], key: 'States', filterForm: false });
    };

    /**
     * Enables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} itemId - Item id
     *
     * @function enableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var enableDropdown = function(id, itemId) {
      $('#' + id).removeAttr('disabled');
      $('#' + id).val(itemId);
      $('#' + id).attr('data-value', itemId);
    };

    /**
     * Disables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} itemId - Item id
     *
     * @function disableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var disableDropdown = function(id, itemId) {
      $('#' + id).empty();
      $('#' + id).val(itemId);
      $('#' + id).attr('data-value', itemId);
      $('#' + id).attr('disabled', 'disabled');
    };

    /**
     * Resets the three dropdowns to its initial states.
     *
     * @function resetDropdowns
     * @memberof Filter(2)
     * @inner
     */
    var resetDropdowns = function() {
      enableDropdown('continents', '');
      disableDropdown('countries', '');
      $('#countries').empty();
      disableDropdown('states', '');
      $('#states').empty();
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Filter(2)
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        updateDatesToCurrent();
        updateTimesToDefault();
        Utils.getSocket().emit('spatialFilterRequest', { ids: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent', filterForm: false });

        setTimeout(function() {
          $('#filter-satellite').val('all');
          $('#filter-satellite-graphics').val('all');
          $('#filter-satellite-attributes-table').val('all');
        }, 4000);
      });
    };

    return {
      getFormattedDateFrom: getFormattedDateFrom,
      getFormattedDateTo: getFormattedDateTo,
      getTimeFrom: getTimeFrom,
      getTimeTo: getTimeTo,
      setSatellites: setSatellites,
      getSatellites: getSatellites,
      setBiomes: setBiomes,
      getBiomes: getBiomes,
      setContinent: setContinent,
      getContinent: getContinent,
      setCountries: setCountries,
      getCountries: getCountries,
      clearCountries: clearCountries,
      setStates: setStates,
      getStates: getStates,
      setCity: setCity,
      getCity: getCity,
      clearStates: clearStates,
      clearSpecialRegions: clearSpecialRegions,
      setSpecialRegions: setSpecialRegions,
      getSpecialRegions: getSpecialRegions,
      getSpecialRegionsCountries: getSpecialRegionsCountries,
      getSpecialRegionsStates: getSpecialRegionsStates,
      getSpecialRegionsCities: getSpecialRegionsCities,
      setProtectedArea: setProtectedArea,
      getProtectedArea: getProtectedArea,
      updateDates: updateDates,
      updateTimes: updateTimes,
      updateDatesToCurrent: updateDatesToCurrent,
      updateTimesToDefault: updateTimesToDefault,
      applyFilter: applyFilter,
      createSpecialRegionsArrays: createSpecialRegionsArrays,
      checkFiresCount: checkFiresCount,
      applyCurrentSituationFilter: applyCurrentSituationFilter,
      selectContinentItem: selectContinentItem,
      selectCountries: selectCountries,
      selectStates: selectStates,
      enableDropdown: enableDropdown,
      disableDropdown: disableDropdown,
      resetDropdowns: resetDropdowns,
      init: init
    };
  }
);
