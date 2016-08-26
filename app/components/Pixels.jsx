
export default class Pixels {
  constructor(data) {
    if (_.isObject(data)) {
      _.each(data, (pixels, y) => this[y] = new Row(pixels))
    }
  }

  addAt(x, y, value) {
    if (y >= 0 && x >= 0) {
      if (!this[y]) this[y] = new Row();

      this[y][x] = new Pixel(value);
    }

    return this;
  }
  deleteAt(x, y) {
    if (this[y]) {
      // If we're deleting the last pixel, delete the entire row
      if (this[y].size == 0) {
        delete this[y]
      } else {
        delete this[y][x];
      }
    }

    return this;
  }
  each(callback) {
    _.each(this, (row, y) => {
      _.each(row, (pixel, x) => {
        callback(x, y, pixel);
      })
    })
  }

  get size() {
    return _.size(this)
  }
  get compressed() {
    return LZString.compress(JSON.stringify(this));
  }
}
