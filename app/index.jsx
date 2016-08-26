import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import _ from 'lodash';
import LZString from 'lz-string';

import Pixels from './components/Pixels.jsx'
import Row from './components/Row.jsx'
import Pixel from './components/Pixel.jsx'

console.clear();

let mountNode = document.getElementById('app-container');

const STORAGE_PREFIX = 'mrbeardy-drawmoji-'

class Layout extends React.Component {
  render() {
    return (
      <div id='app'>
        { this.props.children }
      </div>
    )
  }
}
class Workspace extends React.Component {
  state = {
    drawboardPixelSize: Drawboard.defaultProps.pixelSize,
    drawboardCols: Drawboard.defaultProps.cols,
    drawboardRows: Drawboard.defaultProps.rows,
  };

  updateCols(newCols) {
    this.setState({
      drawboardCols: newCols
    })
  }

  updateRows(newRows) {
    this.setState({
      drawboardRows: newRows
    })
  }

  updatePixelSize(newSize) {
    this.setState({
      drawboardPixelSize: newSize
    })
  }

  render() {
    return (
      <div>
        <div>
          <IncDec onChange={ this.updatePixelSize.bind(this) } count={ this.state.drawboardPixelSize } title='Pixel Size' />
          <IncDec onChange={ this.updateCols.bind(this) } count={ this.state.drawboardCols } title='Columns' />
          <IncDec onChange={ this.updateRows.bind(this) } count={ this.state.drawboardRows } title='Rows' />
        </div>
        <div>
          <Drawboard pixelSize={ this.state.drawboardPixelSize } cols={ this.state.drawboardCols } rows={ this.state.drawboardRows }/>
        </div>
      </div>
    );
  }
}
class IncDec extends React.Component {
  // TODO: Allow IncDec to alter the state value directly, by passing self into it.
  inc() {
    this.props.onChange(this.props.count + 1)
  }
  dec() {
    this.props.onChange(this.props.count - 1)
  }
  prompt() {
    let newCount = parseInt(prompt(`Enter a new value for #{ this.props.title }:`, this.props.count));

    if (newCount !== null)
      this.props.onChange(newCount);
  }
  render() {
    return (
      <div className="inc-dec">
        <div className="ui icon buttons">
          <div onClick={ this.dec.bind(this) } className="ui button"><i className="minus icon"></i></div>
          <div onClick={ this.prompt.bind(this) } className="ui basic button">{ this.props.count } { this.props.title }</div>
          <div onClick={ this.inc.bind(this) } className="ui button"><i className="plus icon"></i></div>
        </div>
      </div>
    )
  }
}
class Drawboard extends React.Component {
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
    this.mouseButton = -1;
    this.mouseDown = false;
    this.lastPixel = "";
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
    this.repaint();
  }
  componentDidUpdate() {
    this.repaint();
  }
  setupContext() {
    this.ctx = this.refs.canvas.getContext('2d');
  }
  repaint() {
    this.clear()
    this.paint()
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());
  }
  paint() {
    this.drawLines();

    if (this.state.pixels) this.drawPixels();
  }
  drawPixels() {
    let pixelSize = this.props.pixelSize;

    this.state.pixels.each((x, y, pixel) => this.drawPixel(x, y, pixel.color))
  }
  drawGhostPixel(x, y) {
    let pixelSize = this.props.pixelSize;

    this.ctx.beginPath()
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }
  drawPixel(x, y, colorId) {
    let pixelSize = this.props.pixelSize;

    this.ctx.beginPath()
    this.ctx.fillStyle = this.state.colors[colorId];
    this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }
  drawLines() {
    let cols = this.props.cols;
    let rows = this.props.rows;
    let pixelSize = this.props.pixelSize;

    let width = this.canvasWidth();
    let height = this.canvasHeight();

    this.ctx.beginPath();

    // Columns
    for (let c = pixelSize; c < width; c += pixelSize) {
      this.ctx.moveTo(c, 0);
      this.ctx.lineTo(c, height);
    }

    // Rows
    for (let r = pixelSize; r < height; r += pixelSize) {
      this.ctx.moveTo(0, r);
      this.ctx.lineTo(width, r);
    }

    this.ctx.strokeStyle = this.state.gridColor;
    this.ctx.stroke();
  }
  canvasWidth() {
    return this.props.pixelSize * this.props.cols
  }
  canvasHeight() {
    return this.props.pixelSize * this.props.rows
  }
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

    // Comment out this repaint for a cool ghosting effect
    this.repaint();
    this.drawGhostPixel(x, y)
  }
  addPixel(x, y, value) {
    this.setState({ pixels: this.state.pixels.addAt(x, y, value) })
  }
  deletePixel(x, y) {
    this.setState({ pixels: this.state.pixels.deleteAt(x, y) })
  }
  storePixels() {
    store.set(STORAGE_PREFIX + "pixels", this.state.pixels.compressed);
  }
  loadPixels() {
    var storedPixels = store.get(STORAGE_PREFIX + "pixels")
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
        <canvas ref='canvas' id='drawmoji-canvas' width={ this.canvasWidth() } height={ this.canvasHeight() }/>
        <div onClick={ this.storePixels.bind(this) } className="ui pink button"> Save</div> { this.state.sizeInfo }
      </div>
    )
  }
}

ReactDOM.render(
  <Router>
    <Route path="/" component={Layout}>
      <IndexRoute component={Workspace} />
    </Route>
  </Router>, mountNode
);
