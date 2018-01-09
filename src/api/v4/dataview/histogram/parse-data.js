var _ = require('underscore');

/**
 * Transform the data obtained from an internal histogram dataview into a
 * public object.
 *
 * @param {object[]} data - The raw histogram data
 * @param {number} nulls - Number of data with a null
 * @param {number} totalAmount - Total number of data in the histogram
 *
 * @return {carto.dataview.HistogramData} - The parsed and formatted data for the given parameters
 */
function parseHistogramData (data, nulls, totalAmount) {
  if (!data) {
    return null;
  }
  var compactData = _.compact(data);
  var maxBin = _.max(compactData, function (bin) { return bin.freq || 0; });
  var maxFreq = _.isFinite(maxBin.freq) && maxBin.freq !== 0
    ? maxBin.freq
    : null;

  /**
   * @description
   * Object containing histogram data.
   *
   * @typedef {object} carto.dataview.HistogramData
   * @property {number} nulls - The number of items with null value
   * @property {number} totalAmount - The number of elements returned
   * @property {carto.dataview.BinItem[]} bins - Array containing the {@link carto.dataview.BinItem|data bins} for the histogram
   * @property {string} type - String with value: **histogram**
   * @api
   */
  return {
    bins: _createBins(compactData, maxFreq),
    nulls: nulls || 0,
    totalAmount: totalAmount
  };
}

/**
 * Transform the histogram raw data into {@link carto.dataview.BinItem}
 */
function _createBins (data, maxFreq) {
  return data.map(function (bin) {
    /**
      * @typedef {object} carto.dataview.BinItem
      * @property {number} index - Number indicating the bin order
      * @property {number} start - The lower limit of the bin
      * @property {number} end - The higher limit of the bin
      * @property {number} min - The minimal value appearing in the bin. Only appears if freq > 0
      * @property {number} max - The minimal value appearing in the bin. Only appears if freq > 0
      * @property {number} avg - The average value of the elements for this bin. Only appears if freq > 0
      * @property {number} freq - Number of elements in the bin
      * @property {number} normalized - Normalized frequency with respect to the whole data
      * @api
      */
    return _.extend(bin, { normalized: _.isFinite(bin.freq) && maxFreq > 0 ? bin.freq / maxFreq : 0 });
  });
}

module.exports = parseHistogramData;
