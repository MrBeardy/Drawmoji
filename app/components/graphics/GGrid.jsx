import GraphicBase from './GraphicBase.jsx'

export default class GGrid extends GraphicBase {
  paint() {
    let cols = this.component.props.cols;
    let rows = this.component.props.rows;
    let pixelSize = this.component.props.pixelSize;

    let width = this.canvasWidth;
    let height = this.canvasHeight;

    let ctx = this.context;

    ctx.beginPath();

    // Columns
    for (let c = pixelSize; c < width; c += pixelSize) {
      ctx.moveTo(c, 0);
      ctx.lineTo(c, height);
    }

    // Rows
    for (let r = pixelSize; r < height; r += pixelSize) {
      ctx.moveTo(0, r);
      ctx.lineTo(width, r);
    }

    ctx.strokeStyle = this.component.state.gridColor;
    ctx.stroke();
  }
}
