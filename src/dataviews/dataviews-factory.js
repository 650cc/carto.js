var _ = require('underscore');
var Model = require('../core/model');
var CategoryFilter = require('../windshaft/filters/category');
var RangeFilter = require('../windshaft/filters/range');
var CategoryDataviewModel = require('./category-dataview-model');
var FormulaDataviewModel = require('./formula-dataview-model');
var HistogramDataviewModel = require('./histogram-dataview-model');
var ListDataviewModel = require('./list-dataview-model');

/**
 * Factory to create dataviews.
 * Takes care of adding and wiring up lifeceycle to other related objects (e.g. dataviews collection, layers etc.)
 */
module.exports = Model.extend({

  initialize: function (attrs, opts) {
    if (!opts.map) throw new Error('map is required');
    if (!opts.dataviewsCollection) throw new Error('dataviewsCollection is required');

    this._map = opts.map;
    this._dataviewsCollection = opts.dataviewsCollection;
  },

  createCategoryModel: function (layerModel, attrs) {
    _checkProperties(attrs, ['column', 'source']);
    attrs = _.pick(attrs, CategoryDataviewModel.ATTRS_NAMES);
    attrs.aggregation = attrs.aggregation || 'count';
    attrs.aggregation_column = attrs.aggregation_column || attrs.column;
    if (this.get('apiKey')) {
      attrs.apiKey = this.get('apiKey');
    }

    var categoryFilter = new CategoryFilter({
      layer: layerModel
    });

    return this._newModel(
      new CategoryDataviewModel(attrs, {
        map: this._map,
        filter: categoryFilter,
        layer: layerModel
      })
    );
  },

  createFormulaModel: function (layerModel, attrs) {
    _checkProperties(attrs, ['column', 'operation', 'source']);
    attrs = _.pick(attrs, FormulaDataviewModel.ATTRS_NAMES);
    if (this.get('apiKey')) {
      attrs.apiKey = this.get('apiKey');
    }

    return this._newModel(
      new FormulaDataviewModel(attrs, {
        map: this._map,
        layer: layerModel
      })
    );
  },

  createHistogramModel: function (layerModel, attrs) {
    _checkProperties(attrs, ['column', 'source']);
    attrs = _.pick(attrs, HistogramDataviewModel.ATTRS_NAMES);
    if (this.get('apiKey')) {
      attrs.apiKey = this.get('apiKey');
    }

    var rangeFilter = new RangeFilter({
      layer: layerModel
    });

    return this._newModel(
      new HistogramDataviewModel(attrs, {
        map: this._map,
        filter: rangeFilter,
        layer: layerModel
      })
    );
  },

  createListModel: function (layerModel, attrs) {
    _checkProperties(attrs, ['columns', 'source']);
    attrs = _.pick(attrs, ListDataviewModel.ATTRS_NAMES);
    if (this.get('apiKey')) {
      attrs.apiKey = this.get('apiKey');
    }

    return this._newModel(
      new ListDataviewModel(attrs, {
        map: this._map,
        layer: layerModel
      })
    );
  },

  _newModel: function (m) {
    this._dataviewsCollection.add(m);
    return m;
  }
});

function _checkProperties (obj, propertiesArray) {
  _.each(propertiesArray, function (prop) {
    if (obj[prop] === undefined) {
      throw new Error(prop + ' is required');
    }
  });
}
