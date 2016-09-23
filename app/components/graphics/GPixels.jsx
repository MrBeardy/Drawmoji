import GraphicBase from './GraphicBase.jsx'
import GPixel from './GPixel.jsx'

export default class GPixels extends GraphicBase {
  paint() {
    
  }

  drawPixel(x, y, colorId) {
    let color = this.component.state.colors[colorId]

    return new GPixel(this.context, this.component, {
      x: x,
      y: y,
      color: color
    }).paint();
  }
}
