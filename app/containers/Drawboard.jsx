
// Utils
import _ from 'lodash';
import LZString from 'lz-string';

// React
import React from 'react';

// App
import data   from '../data'
import Pixels from '../components/Pixels.jsx'
import GGrid  from '../components/graphics/GGrid.jsx'
import GPixel from '../components/graphics/GPixel.jsx'
import GPixels from '../components/graphics/GPixels.jsx'

export default class Drawboard extends React.Component {
  static defaultProps = {
    pixelSize: 20,
    cols: 30,
    rows: 15
  };

  static propTypes = {
    pixelSize: React.PropTypes.number,
    cols: React.PropTypes.number,
    rows: React.PropTypes.number
  };

  state = {
    gridColor: '#ccc',
    colors: ['#cc0000', '#00cc00', '#0000cc'],
    emojiMap: [':polandball:', ':polandball:', ':partyparrot:'],
    spaceEmoji: ':_:',
    currentColor: 2,
    emojiString: '',
    sizInfo: '',
  };

  constructor(props) {
    super(props)

    this.ctx = {};
    this.graphics = {};
    this.mouseButton = -1;
    this.mouseDown = false;
    this.lastPixel = "";
  }

  get canvasWidth() { return this.refs.canvas.width }
  get canvasHeight() { return this.refs.canvas.height }

  get canvasComputedWidth() { return this.props.pixelSize * this.props.cols }
  get canvasComputedHeight() { return this.props.pixelSize * this.props.rows }

  canvasContextMenu(e) {
    if (!e.ctrlKey) {
      e.preventDefault();
    }
  }

  canvasClick(e) {
    if (e.button == 2 && e.ctrlKey) return;

    this.mouseDown = (e.type == "mousedown");
    this.mouseButton = e.button;

    this.canvasMouseEventAlterPixels(e);
  }

  canvasMouseMove(e) {
    this.canvasMouseEventAlterPixels(e);
  }

  canvasMouseEventAlterPixels(e) {
    let pixelSize = this.props.pixelSize;
    let color = this.state.currentColor;
    let x = Math.floor(e.offsetX / pixelSize);
    let y = Math.floor(e.offsetY / pixelSize);

    if (this.mouseDown) {
      let pixelString = `${x} ${y} ${color}`;

      // lastPixel is a little hacky optimization to avoid adding a pixel to the same place
      // for each absolute pixel event for mousemove. This could probably be moved into the
      // addPixel and deletePixel methods to keep this method clean.
      if (pixelString != this.lastPixel && this.mouseButton == 0) {
        this.addPixel(x, y, color)

        this.lastPixel = pixelString;
      } else if (this.mouseButton == 2) {
        this.deletePixel(x, y);

        this.lastPixel = "";
      }
    } else {
      this.setState({
        sizeInfo: this.state.pixels.compressed.length
      })
    }

    this.repaint();
    this.drawGhostPixel(x, y)
  }

  componentDidMount() {
    this.refs.canvas.addEventListener('contextmenu', this.canvasContextMenu.bind(this), false);
    this.refs.canvas.addEventListener('mousedown', this.canvasClick.bind(this));
    this.refs.canvas.addEventListener('mouseup', this.canvasClick.bind(this));
    this.refs.canvas.addEventListener('mousemove', this.canvasMouseMove.bind(this));

    this.setState({
      pixels: this.loadPixels()
    })

    this.setupContext();
    this.setupGraphics();
    this.repaint();
  }

  componentDidUpdate() {
    this.repaint();
  }

  setupContext() {
    this.ctx = this.refs.canvas.getContext('2d');
  }

  setupGraphics() {
    this.graphics.grid = new GGrid(this.ctx, this);
    this.graphics.pixels = new GPixels(this.ctx, this);
  }

  repaint() {
    this.clear()
    this.paint()
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  paint() {
    _.each(this.graphics, (graphic) => graphic.paint());

    if (this.state.pixels) this.drawPixels();
  }

  drawGhostPixel(x, y) {
    return new GPixel(this.ctx, this, {
      x: x,
      y: y,
      color: "rgba(0, 0, 0, 0.3)"
    }).paint()
  }

  drawPixels() {
    let pixelSize = this.props.pixelSize;

    this.state.pixels.each((x, y, pixel) => this.drawPixel(x, y, pixel.color))
  }

  drawPixel(x, y, colorId) {
    let color = this.state.colors[colorId]

    return new GPixel(this.ctx, this, {
      x: x,
      y: y,
      color: color
    }).paint()
  }

  addPixel(x, y, value) {
    this.setState({ pixels: this.state.pixels.addAt(x, y, value) })
  }

  deletePixel(x, y) {
    this.setState({ pixels: this.state.pixels.deleteAt(x, y) })
  }

  storePixels() {
    store.set(data.STORAGE_PREFIX + "pixels", this.state.pixels.compressed);
  }

  loadPixels() {
    var storedPixels = store.get(data.STORAGE_PREFIX + "pixels")
    var pixels;

    if (storedPixels) {
      pixels = new Pixels(JSON.parse(LZString.decompress(storedPixels)))
    } else {
      pixels = new Pixels();
    }

    return pixels;
  }

  render() {
    return (
      <div>
        <div onClick={ () => this.setState({currentColor: 0}) } className="ui red button"> red</div>
        <div onClick={ () => this.setState({currentColor: 1}) } className="ui green button"> green</div>
        <div onClick={ () => this.setState({currentColor: 2}) } className="ui blue button"> blue</div>

        <canvas ref='canvas' id='drawmoji-canvas' width={ this.canvasComputedWidth } height={ this.canvasComputedHeight }/>

        <div onClick={ this.storePixels.bind(this) } className="ui pink button"> Save</div> { this.state.sizeInfo }
      </div>
    )
  }
}
