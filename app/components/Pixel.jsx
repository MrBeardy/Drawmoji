export default class Pixel {
  constructor(value) {
    this.value = value;
  }

  get color() {
    return this.value
  }

  toJSON() {
    return this.value;
  }
}
