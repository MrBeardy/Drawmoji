import _ from 'lodash';

import Pixel from './Pixel.jsx'

export default class Row {
  constructor(pixels) {
    if (pixels) _.each(pixels, (value, x) => this[x] = new Pixel(value))
  }
  get size() {
    return _.size(this)
  }
  get emojiString() {
  }
}
