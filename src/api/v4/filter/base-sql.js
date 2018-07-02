const _ = require('underscore');
const Base = require('./base');

const ALLOWED_OPTIONS = ['includeNull'];
const DEFAULT_JOIN_OPERATOR = 'AND';

/**
 * SQL Filter
 *
 * A SQL filter is the base for all the SQL filters such as the Category Filter or the Range filter
 *
 * @class carto.filter.SQLBase
 * @extends carto.filter.Base
 * @memberof carto.filter
 */
class SQLBase extends Base {
  /**
   * Creates an instance of SQLBase.
   * @param {string} column - The filtering will be performed against this column
   * @param {object} [options={}]
   * @param {boolean} [options.includeNull] - The operation to apply to the data
   * @param {boolean} [options.reverseConditions] - The operation to apply to the data
   * @memberof carto.filter.SQLBase
   */
  constructor (column, options = {}) {
    super();

    this._checkColumn(column);
    this._checkOptions(options);

    this._column = column;
    this._filters = {};
    this._options = options;
  }

  /**
   * Set any of the filter conditions, overwriting the previous one.
   * @param {string} filterType - The filter type that you want to set
   * @param {string} filterValue - The value of the filter
   */
  set (filterType, filterValue) {
    const newFilter = { [filterType]: filterValue };

    this._checkFilters(newFilter);
    this._filters[filterType] = filterValue;

    this.trigger('change:filters', newFilter);
  }

  /**
   * Set the filter conditions, overriding all the previous ones.
   * @param {object} filters - The object containing all the new filters to apply.
   */
  setFilters (filters) {
    this._checkFilters(filters);
    this._filters = filters;

    this.trigger('change:filters', filters);
  }

  getSQL () {
    const filters = Object.keys(this._filters);
    let sql = filters.map(filterType => this._interpolateFilter(filterType, this._filters[filterType]))
      .join(` ${DEFAULT_JOIN_OPERATOR} `);

    if (this._options.includeNull) {
      this._includeNullInQuery(sql);
    }

    return sql;
  }

  _checkColumn (column) {
    if (_.isUndefined(column)) {
      throw this._getValidationError('columnRequired');
    }

    if (!_.isString(column)) {
      throw this._getValidationError('columnString');
    }

    if (_.isEmpty(column)) {
      throw this._getValidationError('emptyColumn');
    }
  }

  _checkFilters (filters) {
    Object.keys(filters).forEach(filter => {
      const isFilterValid = _.contains(this.ALLOWED_FILTERS, filter);

      if (!isFilterValid) {
        throw this._getValidationError(`invalidFilter${filter}`);
      }

      const parameters = this.PARAMETER_SPECIFICATION[filter].parameters;
      const haveCorrectType = parameters.every(
        parameter => {
          const parameterValue = _.property(parameter.name)(filters[filter]) || filters[parameter.name];
          return parameter.allowedTypes.some(type => parameterIsOfType(type, parameterValue));
        }
      );

      if (!haveCorrectType) {
        throw this._getValidationError(`invalidParameterType${filter}`);
      }
    });
  }

  _checkOptions (options) {
    Object.keys(options).forEach(option => {
      const isOptionValid = _.contains(ALLOWED_OPTIONS, option);

      if (!isOptionValid) {
        throw this._getValidationError(`invalidOption${option}`);
      }
    });
  }

  _convertValueToSQLString (filterValue) {
    if (_.isDate(filterValue)) {
      return `'${filterValue.toISOString()}'`;
    }

    if (_.isArray(filterValue)) {
      return filterValue
        .map(value => `'${value.toString()}'`)
        .join(',');
    }

    if (_.isObject(filterValue) || _.isNumber(filterValue)) {
      return filterValue;
    }

    return `'${filterValue.toString()}'`;
  }

  _interpolateFilter (filterType, filterValue) {
    const sqlString = _.template(this.SQL_TEMPLATES[filterType]);
    return sqlString({ column: this._column, value: this._convertValueToSQLString(filterValue) });
  }

  _includeNullInQuery (sql) {
    const filters = Object.keys(this._filters);

    if (filters.length > 1) {
      sql = `(${sql})`;
    }

    return `(${sql} OR ${this._column} IS NULL)`;
  }
}

const parameterIsOfType = function (parameterType, parameterValue) {
  return _[`is${parameterType}`](parameterValue);
};

module.exports = SQLBase;
