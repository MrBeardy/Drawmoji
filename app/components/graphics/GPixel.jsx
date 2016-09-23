import GraphicBase from './GraphicBase.jsx'

export default class GPixel extends GraphicBase {
  paint() {
    let pixelSize = this.component.props.pixelSize;
    let x = this.props.x;
    let y = this.props.y;

    this.context.beginPath()
    this.context.fillStyle = this.props.color;
    this.context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }
}
