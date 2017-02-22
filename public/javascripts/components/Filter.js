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
 * @property {object} memberProtectedArea - Current protected area.
 * @property {boolean} memberIndustrialFires - Current industrial fires filter.
 * @property {boolean} memberInitialFilter - Flag that indicates if the current filter is the initial one.
 * @property {array} memberInitialSatellites - Initial satellites.
 * @property {object} memberLastFilters - Last filters used in the layers.
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
    // Current protected area
    var memberProtectedArea = null;
    // Current industrial fires filter
    var memberIndustrialFires = false;
    // Flag that indicates if the current filter is the initial one
    var memberInitialFilter = true;
    // Initial satellites
    var memberInitialSatellites = null;
    // Last filters used in the layers
    var memberLastFilters = {};

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
     * Clears the list of selected special regions countries.
     *
     * @function clearSpecialRegionsCountries
     * @memberof Filter(2)
     * @inner
     */
    var clearSpecialRegionsCountries = function() {
      setSpecialRegionsCountries([]);
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
     * Sets the special regions countries array.
     * @param {array} specialRegionsCountries - Special regions countries array
     *
     * @function setSpecialRegionsCountries
     * @memberof Filter(2)
     * @inner
     */
    var setSpecialRegionsCountries = function(specialRegionsCountries) {
      memberSpecialRegionsCountries = specialRegionsCountries;
    };

    /**
     * Returns the special regions countries array.
     * @returns {array} memberSpecialRegionsCountries - Special regions countries array
     *
     * @function getSpecialRegionsCountries
     * @memberof Filter(2)
     * @inner
     */
    var getSpecialRegionsCountries = function() {
      return memberSpecialRegionsCountries;
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
     * Sets the current industrial fires filter.
     * @param {boolean} industrialFires - Industrial fires filter
     *
     * @function setIndustrialFires
     * @memberof Filter(2)
     * @inner
     */
    var setIndustrialFires = function(industrialFires) {
      memberIndustrialFires = industrialFires;
    };

    /**
     * Returns the current industrial fires filter.
     * @returns {boolean} memberIndustrialFires - Current industrial fires filter
     *
     * @function getIndustrialFires
     * @memberof Filter(2)
     * @inner
     */
    var getIndustrialFires = function() {
      return memberIndustrialFires;
    };

    /**
     * Returns the initial filter flag.
     * @returns {boolean} memberInitialFilter - Flag that indicates if the current filter is the initial one
     *
     * @function isInitialFilter
     * @memberof Filter(2)
     * @inner
     */
    var isInitialFilter = function() {
      return memberInitialFilter;
    };

    /**
     * Sets the initial filter flag to false.
     *
     * @function setInitialFilterToFalse
     * @memberof Filter(2)
     * @inner
     */
    var setInitialFilterToFalse = function() {
      memberInitialFilter = false;
    };

    /**
     * Returns the array of initial satellites.
     * @returns {array} memberInitialSatellites - Initial satellites
     *
     * @function getInitialSatellites
     * @memberof Filter(2)
     * @inner
     */
    var getInitialSatellites = function() {
      return memberInitialSatellites;
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
      memberDateFrom = Utils.getCurrentDate(true);
      memberDateTo = Utils.getCurrentDate(true);
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

      if(memberInitialFilter) {
        var memberSatellitesLength = memberInitialSatellites.length;

        for(var i = 0; i < memberSatellitesLength; i++) {
          cql += "'" + memberInitialSatellites[i] + "',";
        }
      } else {
        var memberSatellitesLength = memberSatellites.length;

        for(var i = 0; i < memberSatellitesLength; i++) {
          cql += "'" + memberSatellites[i] + "',";
        }
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

      var memberBiomesLength = memberBiomes.length;

      for(var i = 0; i < memberBiomesLength; i++) {
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

      for(var i = 0, memberCountriesLength = memberCountries.length; i < memberCountriesLength; i++) {
        cql += memberCountries[i] + ",";
      }

      for(var i = 0, memberSpecialRegionsCountriesLength = memberSpecialRegionsCountries.length; i < memberSpecialRegionsCountriesLength; i++) {
        cql += memberSpecialRegionsCountries[i] + ",";
      }

      cql = cql.substring(0, cql.length - 1) + ")";

      return cql;
    };

    /**
     * Creates the continent filter.
     * @returns {string} cql - Continent cql filter
     *
     * @private
     * @function createContinentFilter
     * @memberof Filter(2)
     * @inner
     */
    var createContinentFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.ContinentFieldName + " = " + memberContinent;

      return cql;
    };

    /**
     * Creates the states and special regions filter.
     * @returns {string} cql - States and special regions cql filter
     *
     * @private
     * @function createStatesAndSpecialRegionsFilter
     * @memberof Filter(2)
     * @inner
     */
    var createStatesAndSpecialRegionsFilter = function() {
      var cql = "";

      if(memberStates.length > 0) {
        cql += (memberSpecialRegions.length > 0 ? "(" : "") + Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName + " in (";

        for(var i = 0, memberStatesLength = memberStates.length; i < memberStatesLength; i++) {
          cql += "'" + memberStates[i] + "',";
        }

        cql = cql.substring(0, cql.length - 1) + ")";
      }

      if(memberSpecialRegions.length > 0) {
        cql += (memberStates.length > 0 ? " or (" : "(");

        for(var i = 0, memberSpecialRegionsLength = memberSpecialRegions.length; i < memberSpecialRegionsLength; i++) {
          cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.SpecialRegionsFieldName + " like '%|" + memberSpecialRegions[i] + "|%' or ";
        }

        cql = cql.substring(0, cql.length - 4) + (memberStates.length > 0 ? "))" : ")");
      }

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
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.CityFieldName + "='" + memberCity + "'";

      return cql;
    };

    /**
     * Creates the industrial fires filter.
     * @returns {string} cql - Industrial fires cql filter
     *
     * @private
     * @function createIndustrialFiresFilter
     * @memberof Filter(2)
     * @inner
     */
    var createIndustrialFiresFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.IndustrialFiresFieldName + " IS NULL";

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

        setIndustrialFires($('#' + Utils.getConfigurations().filterConfigurations.IndustrialAreasLayer.Id.replace(':', '') + ' > input').is(':checked'));

        var cql = "";

        if(filterDateFrom.length > 0 && filterDateTo.length > 0 && filterTimeFrom.length > 0 && filterTimeTo.length > 0) {
          var updateLayersTime = ((getFormattedDateFrom("YYYY/MM/DD") != filterDateFrom) || (getFormattedDateTo("YYYY/MM/DD") != filterDateTo));

          updateDates(filterDateFrom, filterDateTo, 'YYYY/MM/DD');
          updateTimes(filterTimeFrom, filterTimeTo);

          cql += createDateTimeFilter() + " AND ";

          if(Map.getLayers().length > 0) processLayers(Map.getLayers(), updateLayersTime);
        }

        if(!Utils.stringInArray(memberSatellites, "all") || memberInitialFilter) {
          cql += createSatellitesFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberBiomes, "all")) {
          cql += createBiomesFilter() + " AND ";
        }

        if(memberContinent !== null) {
          cql += createContinentFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberCountries, "") && memberCountries.length > 0) {
          cql += createCountriesFilter() + " AND ";
        }

        if((!Utils.stringInArray(memberStates, "") && memberStates.length > 0) || (memberSpecialRegions.length > 0)) {
          cql += createStatesAndSpecialRegionsFilter() + " AND ";
        }

        if(memberCity !== null) {
          cql += createCitiesFilter() + " AND ";
        }

        if(!memberIndustrialFires) {
          cql += createIndustrialFiresFilter() + " AND ";
        }

        if(cql.length > 5) {
          cql = cql.substring(0, cql.length - 5);
        }

        updateSatellitesSelect(0);
        TerraMA2WebComponents.MapDisplay.applyCQLFilter(cql, Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId);
      }

      if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
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
      var continent = memberContinent === null ? '' : memberContinent.toString();
      var countries = (Utils.stringInArray(getCountries(), "") || getCountries().length === 0 ? '' : getCountries().toString());
      var states = (Utils.stringInArray(getStates(), "") || getStates().length === 0 ? '' : getStates().toString());

      Utils.getSocket().emit('checkFiresCountRequest', {
        dateFrom: dateFrom,
        dateTo: dateTo,
        satellites: satellites,
        biomes: biomes,
        extent: extent,
        continent: continent,
        countries: countries,
        states: states
      });
    };

    /**
     * Processes a list of layers and applies filters to the layers that should be filtered.
     * @param {array} layers - Layers array
     * @param {boolean} updateLayersTime - Flag that indicates if the time of the layers should be updated
     *
     * @private
     * @function processLayers
     * @memberof Filter(2)
     * @inner
     */
    var processLayers = function(layers, updateLayersTime) {
      for(var i = 0, layersLength = layers.length; i < layersLength; i++) {
        if(layers[i].Params.Time !== undefined && layers[i].Params.Time !== null && layers[i].Params.Time.match("{{(.*)}}") !== null && (memberInitialFilter || updateLayersTime)) Map.updateLayerTime(layers[i]);

        if(layers[i].Id === Utils.getConfigurations().filterConfigurations.CountriesLayer.Id || layers[i].Id === Utils.getConfigurations().filterConfigurations.CountriesLabelsLayer.Id) {
          if(memberContinent !== null) {
            var field = layers[i].Id === Utils.getConfigurations().filterConfigurations.CountriesLayer.Id ? Utils.getConfigurations().filterConfigurations.CountriesLayer.ContinentField : Utils.getConfigurations().filterConfigurations.CountriesLabelsLayer.ContinentField;
            var cqlFilter = field + "=" + memberContinent;

            if(memberInitialFilter || cqlFilter != memberLastFilters[layers[i].Id]) {
              TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layers[i].Id);
              memberLastFilters[layers[i].Id] = cqlFilter;
            }
          }
        } else if(layers[i].Id === Utils.getConfigurations().filterConfigurations.StatesLayer.Id || layers[i].Id === Utils.getConfigurations().filterConfigurations.StatesLabelsLayer.Id) {
          var cqlFilter = (layers[i].Id === Utils.getConfigurations().filterConfigurations.StatesLayer.Id ? Utils.getConfigurations().filterConfigurations.StatesLayer.CountryField : Utils.getConfigurations().filterConfigurations.StatesLabelsLayer.CountryField) + " in (";

          var memberCountriesLength = memberCountries.length;

          if(memberCountriesLength > 0) {
            for(var count = 0; count < memberCountriesLength; count++) cqlFilter += memberCountries[count] + ",";

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
          } else {
            cqlFilter += "0)";
          }

          if(memberInitialFilter || cqlFilter != memberLastFilters[layers[i].Id]) {
            TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layers[i].Id);
            memberLastFilters[layers[i].Id] = cqlFilter;
          }
        } else if(layers[i].Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id || layers[i].Id === Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.Id) {
          var cqlFilter = (layers[i].Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id ? Utils.getConfigurations().filterConfigurations.CitiesLayer.CountryField : Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CountryField) + " in (";

          if($('#states').val() !== null) {
            var states = $('#states').val();
            var index = states.indexOf("0");
          } else {
            var index = -1;
          }

          if(index > -1) {
            var memberCountriesLength = memberCountries.length;

            if(memberCountriesLength > 0) {
              for(var count = 0; count < memberCountriesLength; count++) cqlFilter += memberCountries[count] + ",";
              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          } else {
            var memberStatesLength = memberStates.length;

            if(memberStatesLength > 0) {
              var statesCqlFilter = (layers[i].Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id ? Utils.getConfigurations().filterConfigurations.CitiesLayer.StateField : Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.StateField) + " in (";
              var citiesCqlFilter = (layers[i].Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id ? Utils.getConfigurations().filterConfigurations.CitiesLayer.CityField : Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CityField) + " in (";

              for(var count = 0; count < memberStatesLength; count++) {
                var ids = Utils.getStateIds(memberStates[count]);
                cqlFilter += ids[0] + ",";
                statesCqlFilter += "'" + memberStates[count] + "',";
              }

              cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 1)) + ") AND " + statesCqlFilter.substring(0, (statesCqlFilter.length - 1)) + ")";
            } else {
              cqlFilter += "0)";
            }
          }

          if(memberInitialFilter || cqlFilter != memberLastFilters[layers[i].Id]) {
            TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layers[i].Id);
            memberLastFilters[layers[i].Id] = cqlFilter;
          }
        } else if(layers[i].Id === Utils.getConfigurations().filterConfigurations.SpecialRegionsLayer.Id) {
          var featuresIds = "";
          var layerIdArray = layers[i].Id.split(':');

          if(memberSpecialRegions.length > 0) {
            for(var j = 0, memberSpecialRegionsLength = memberSpecialRegions.length; j < memberSpecialRegionsLength; j++)
              featuresIds += layerIdArray[1] + '.' + memberSpecialRegions[j] + ',';

            featuresIds = featuresIds.substring(0, (featuresIds.length - 1));
          } else {
            featuresIds = layerIdArray[1] + '.0';
          }

          if(memberInitialFilter || featuresIds != memberLastFilters[layers[i].Id]) {
            TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layers[i].Id, { 'featureId': featuresIds }, true);
            memberLastFilters[layers[i].Id] = featuresIds;
          }
        } else if(Utils.stringInArray(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, layers[i].Id)) {
          var countries = $('#countries').val();
          var currentSituationFilterString = JSON.stringify({
            dateFrom: Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeFrom,
            dateTo: Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeTo,
            continent: memberContinent,
            countries: countries,
            states: memberStates,
            satellites: memberSatellites,
            biomes: memberBiomes
          });

          if(memberInitialFilter || currentSituationFilterString != memberLastFilters[layers[i].Id]) {
            applyCurrentSituationFilter(
              Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeFrom,
              Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat) + ' ' + memberTimeTo,
              memberContinent,
              countries,
              memberStates,
              memberSatellites,
              memberBiomes,
              layers[i].Id
            );

            memberLastFilters[layers[i].Id] = currentSituationFilterString;
          }
        }
      }
    };

    /**
     * Applies filters to the current situation layers.
     * @param {int} begin - Initial date / time
     * @param {int} end - Final date / time
     * @param {int} continent - Continent id
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
    var applyCurrentSituationFilter = function(begin, end, continent, countries, states, satellites, biomes, layer) {
      var currentSituationFilter = "begin:" + begin + ";end:" + end;

      if(continent !== undefined && continent !== null && continent !== "" && continent !== '') {
        currentSituationFilter += ";continent:" + continent;
      }

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
     * @param {integer} filter - Number that indicates which filter fields should be used: 0 - main filter, 1 - attributes table filter, 2 - graphics filter
     * @param {date} filterDateFrom - Filter date from
     * @param {date} filterDateTo - Filter date to
     *
     * @function updateSatellitesSelect
     * @memberof Filter(2)
     * @inner
     */
    var updateSatellitesSelect = function(filter, filterDateFrom, filterDateTo) {
      var filterFieldsExtention = '';

      if(filter === 1) {
        filterFieldsExtention = '-attributes-table';
      } else if(filter === 2) {
        filterFieldsExtention = '-graphics';
      }

      var dateFrom = memberDateFrom;
      var dateTo = memberDateTo;

      if(filterFieldsExtention !== '') {
        dateFrom = filterDateFrom;
        dateTo = filterDateTo;
      }

      var selectedOptions = (filterFieldsExtention !== '' ? $('#filter-satellite' + filterFieldsExtention).val() : $('#filter-satellite').val());

      var allOption = Utils.stringInArray(selectedOptions, "all") ? "<option value=\"all\" selected>TODOS</option>" : "<option value=\"all\">TODOS</option>";
      var referenceSatellite = "";
      var elem = "";
      var satellitesList = Utils.getConfigurations().filterConfigurations.Satellites;

      for(var i = 0, satellitesListLength = satellitesList.length; i < satellitesListLength; i++) {
        var satelliteBegin = Utils.getCurrentDate(true);
        var satelliteEnd = Utils.getCurrentDate(true);

        var satelliteReferenceBegin = Utils.getCurrentDate(true);
        var satelliteReferenceEnd = Utils.getCurrentDate(true);

        if(satellitesList[i].Begin !== "") {
          var satelliteBeginArray = satellitesList[i].Begin.split('-');
          satelliteBegin = new Date(parseInt(satelliteBeginArray[0]), parseInt(satelliteBeginArray[1]) - 1, parseInt(satelliteBeginArray[2]), 0, 0, 0);
        }

        if(satellitesList[i].End !== "") {
          var satelliteEndArray = satellitesList[i].End.split('-');
          satelliteEnd = new Date(parseInt(satelliteEndArray[0]), parseInt(satelliteEndArray[1]) - 1, parseInt(satelliteEndArray[2]), 0, 0, 0);
        }

        if(satellitesList[i].ReferenceBegin !== "") {
          var satelliteReferenceBeginArray = satellitesList[i].ReferenceBegin.split('-');
          satelliteReferenceBegin = new Date(parseInt(satelliteReferenceBeginArray[0]), parseInt(satelliteReferenceBeginArray[1]) - 1, parseInt(satelliteReferenceBeginArray[2]), 0, 0, 0);
        }

        if(satellitesList[i].ReferenceEnd !== "") {
          var satelliteReferenceEndArray = satellitesList[i].ReferenceEnd.split('-');
          satelliteReferenceEnd = new Date(parseInt(satelliteReferenceEndArray[0]), parseInt(satelliteReferenceEndArray[1]) - 1, parseInt(satelliteReferenceEndArray[2]), 0, 0, 0);
        }

        if((dateFrom <= satelliteBegin && dateTo >= satelliteEnd) || 
          (dateFrom >= satelliteBegin && dateTo <= satelliteEnd) || 
          (dateFrom <= satelliteBegin && dateTo >= satelliteBegin) || 
          (dateFrom <= satelliteEnd && dateTo >= satelliteEnd)) {

          if((dateFrom <= satelliteReferenceBegin && dateTo >= satelliteReferenceEnd) || 
            (dateFrom >= satelliteReferenceBegin && dateTo <= satelliteReferenceEnd) || 
            (dateFrom <= satelliteReferenceBegin && dateTo >= satelliteReferenceBegin) || 
            (dateFrom <= satelliteReferenceEnd && dateTo >= satelliteReferenceEnd)) {
            if(Utils.stringInArray(selectedOptions, satellitesList[i].Id)) {
              referenceSatellite += "<option value=\"" + satellitesList[i].Id + "\" selected>Refer. (" + satellitesList[i].Name + ")</option>";
            } else {
              referenceSatellite += "<option value=\"" + satellitesList[i].Id + "\">Refer. (" + satellitesList[i].Name + ")</option>";
            }
          } else {
            if(Utils.stringInArray(selectedOptions, satellitesList[i].Id)) {
              elem += "<option value=\"" + satellitesList[i].Id + "\" selected>" + satellitesList[i].Name + "</option>";
            } else {
              elem += "<option value=\"" + satellitesList[i].Id + "\">" + satellitesList[i].Name + "</option>";
            }
          }
        } else if(Utils.stringInArray(selectedOptions, satellitesList[i].Id)) {
          elem += "<option value=\"" + satellitesList[i].Id + "\" selected>" + satellitesList[i].Name + "</option>";
        }
      }

      if(filterFieldsExtention !== '')
        $('#filter-satellite' + filterFieldsExtention).empty().html(allOption + referenceSatellite + elem);
      else {
        $('#filter-satellite').empty().html(allOption + referenceSatellite + elem);
        $('#filter-satellite-attributes-table').empty().html(allOption + referenceSatellite + elem);
        $('#filter-satellite-graphics').empty().html(allOption + referenceSatellite + elem);
      }
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
      Utils.getSocket().emit('spatialFilterRequest', { ids: ids, specialRegions: [], specialRegionsCountries: [], key: 'States', filterForm: false });
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

      enableDropdown('continents-graphics', '');
      enableDropdown('countries-graphics', '');
      $('#countries-graphics').empty();
      disableDropdown('states-graphics', '');
      $('#states-graphics').empty();

      enableDropdown('continents-attributes-table', '');
      enableDropdown('countries-attributes-table', '');
      $('#countries-attributes-table').empty();
      disableDropdown('states-attributes-table', '');
      $('#states-attributes-table').empty();

      $('#continents-graphics').val(Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter);
      $('#continents-graphics').change();
      $('#continents-attributes-table').val(Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter);
      $('#continents-attributes-table').change();
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

        memberInitialSatellites = initialSatellites;

        $('#filter-satellite').val('all');
        $('#filter-satellite-graphics').val('all');
        $('#filter-satellite-attributes-table').val('all');
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
      clearSpecialRegionsCountries: clearSpecialRegionsCountries,
      setSpecialRegions: setSpecialRegions,
      getSpecialRegions: getSpecialRegions,
      setSpecialRegionsCountries: setSpecialRegionsCountries,
      getSpecialRegionsCountries: getSpecialRegionsCountries,
      setProtectedArea: setProtectedArea,
      getProtectedArea: getProtectedArea,
      setIndustrialFires: setIndustrialFires,
      getIndustrialFires: getIndustrialFires,
      isInitialFilter: isInitialFilter,
      setInitialFilterToFalse: setInitialFilterToFalse,
      getInitialSatellites: getInitialSatellites,
      updateDates: updateDates,
      updateTimes: updateTimes,
      updateDatesToCurrent: updateDatesToCurrent,
      updateTimesToDefault: updateTimesToDefault,
      applyFilter: applyFilter,
      checkFiresCount: checkFiresCount,
      applyCurrentSituationFilter: applyCurrentSituationFilter,
      updateSatellitesSelect: updateSatellitesSelect,
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
