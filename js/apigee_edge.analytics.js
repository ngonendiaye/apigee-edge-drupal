/*
 * Copyright 2018 Google Inc.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License version 2 as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 * License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

/**
 * @file
 * Javascript functions related to the Analytics page of developer app entities.
 */
(function ($, Drupal, drupalSettings) {

  'use strict';

  /**
   * Draws the developer app analytics chart on the page.
   *
   * Use drupalSettings to pass analytics data, library and visualization options.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches Apigee Edge analytics draw behavior.
   *
   * @see {@link https://developers.google.com/chart|Google Charts}
   */
  Drupal.behaviors.apigeeEdgeAnalyticsDraw = {
    attach: function attach(context, drupalSettings) {
      $(context).find('body').once('load_google_chart').each(function () {
        var metric = drupalSettings.analytics.metric;
        var timestamps = drupalSettings.analytics.timestamps;
        var values = drupalSettings.analytics.values;
        var skipZeroValues = drupalSettings.analytics.skip_zero_values;
        var visualizationOptions = drupalSettings.analytics.visualization_options;
        var visualizationOptionsToDate = drupalSettings.analytics.visualization_options_to_date;
        var version = drupalSettings.analytics.version;
        var language = drupalSettings.analytics.language;
        var chartContainer = drupalSettings.analytics.chart_container;

        // Stop drawing if there is no analytics data.
        if(values === null) {
          return;
        }

        // If the passed version doesn't exist, default to 'current' (stable).
        google.charts.load(version === null ? 'current' : version, {'packages':['corechart'], 'language': language});
        google.charts.setOnLoadCallback(callback);

        /**
         * A callback function that will be called once the Google Charts library
         * packages have been loaded.
         */
        function callback() {
          var data = new google.visualization.DataTable();
          data.addColumn('datetime');
          data.addColumn('number', metric);
          for (var i = 0; i < timestamps.length; i++) {
            if(skipZeroValues && values[i] === 0) {
              continue;
            }
            data.addRow([new Date(timestamps[i]), values[i]]);
          }

          var options = visualizationOptions === null ? {} : JSON.parse(visualizationOptions);
          for (i = 0; i < visualizationOptionsToDate.length; i++) {
            setNestedObjectDateProperty(options, visualizationOptionsToDate[i]);
          }

          var chart = new google.visualization.LineChart(document.getElementById(chartContainer));
          chart.draw(data, options);
        }

        /**
         * A helper recursive function that convert timestamp
         * property values of nested objects to JS Date objects.
         */
        function setNestedObjectDateProperty(object, route) {
          if (typeof(route) === 'string') {
            route = route.split('.');
          }
          if (route.length > 1){
            setNestedObjectDateProperty(object[route.shift()], route);
          }
          else {
            object[route[0]] = new Date(object[route[0]]);
          }
        }
      });
    }
  };

  /**
   * Quick date picker select list change event listener.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches Apigee Edge analytics quick date picker behavior.
   */
  Drupal.behaviors.apigeeEdgeAnalyticsQuickDatePicker = {
    attach: function attach(context) {
      $('#edit-quick-date-picker', context).once().bind('change', function() {
        var since = new Date();
        switch(this.selectedOptions['0'].value) {
          case '1d':
            since.setDate(since.getDate()-1);
            break;
          case '1w':
            since.setDate(since.getDate()-7);
            break;
          case '2w':
            since.setDate(since.getDate()-14);
            break;
          default:
            return;
        }
        var sinceLocalDateString = since.getFullYear() + '-' + (('0' + (since.getMonth() + 1)).slice(-2)) + '-' + (('0' + since.getDate()).slice(-2));
        var sinceLocalTimeString = (('0' + (since.getHours())).slice(-2)) + ':' + (('0' + (since.getMinutes())).slice(-2)) + ':' + (('0' + since.getSeconds()).slice(-2));
        $('#edit-since-date').val(sinceLocalDateString);
        $('#edit-since-time').val(sinceLocalTimeString);

        var until = new Date();
        var untilLocalDateString = until.getFullYear() + '-' + (('0' + (until.getMonth() + 1)).slice(-2)) + '-' + (('0' + until.getDate()).slice(-2));
        var untilLocalTimeString = (('0' + (until.getHours())).slice(-2)) + ':' + (('0' + (until.getMinutes())).slice(-2)) + ':' + (('0' + until.getSeconds()).slice(-2));
        $('#edit-until-date').val(untilLocalDateString);
        $('#edit-until-time').val(untilLocalTimeString);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);