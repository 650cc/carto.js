const carto = require('../../../../../src/api/v4/index');

describe('api/v4/filter/category', function () {
  describe('constructor', function () {
    it('should throw a descriptive error when an unknown filter has been passed', function () {
      expect(function () {
        new carto.filter.Category('fake_column', { unknown_filter: '' }); // eslint-disable-line
      }).toThrowError("'unknown_filter' is not a valid filter. Please check documentation.");
    });
  });

  describe('SQL Templates', function () {
    it('IN', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { in: ['Category 1'] });
      expect(categoryFilter.$getSQL()).toBe("fake_column IN ('Category 1')");
    });

    it('NOT IN', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { notIn: ['Category 1'] });
      expect(categoryFilter.$getSQL()).toBe("fake_column NOT IN ('Category 1')");
    });

    it('EQ', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { eq: 'Category 1' });
      expect(categoryFilter.$getSQL()).toBe("fake_column = 'Category 1'");
    });

    it('NOT EQ', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { notEq: 'Category 1' });
      expect(categoryFilter.$getSQL()).toBe("fake_column != 'Category 1'");
    });

    it('LIKE', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { like: '%Category%' });
      expect(categoryFilter.$getSQL()).toBe("fake_column LIKE '%Category%'");
    });

    it('SIMILAR TO', function () {
      const categoryFilter = new carto.filter.Category('fake_column', { similarTo: '%Category%' });
      expect(categoryFilter.$getSQL()).toBe("fake_column SIMILAR TO '%Category%'");
    });
  });
});
