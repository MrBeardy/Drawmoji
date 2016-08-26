var {
  Router,
  Route,
  IndexRoute,
  Link,
  browserHistory
} = ReactRouter

class Pixels {
  constructor(data) {
    if (_.isObject(data)) {
      if (data) _.each(rows, (pixels, y) => this[y] = new Row(pixels))
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

  // SPIKE (deep-nested compression):, i.e. add a compressed method to the
  // Row and Pixel classes, compress their data, and use the compressed byte strings
  // in the json that is passed to the compress method here.
  // In theory it should compress to the same size, but it may end up bigger/smaller.
  get compressed() {
    return LZString.compress(JSON.stringify(this));
  }

/* Proof of concept: Row/pixel shifting
  shiftDown() {
    return _.eachRight(this, (row, y) => {
      var y = parseInt(y)

      this[y + 1] = row;
      delete this[y]
    });
  }
*/
}
class Row {
  constructor(pixels) {
    if (pixels) _.each(pixels, (value, x) => this[x] = new Pixel(value))
  }
  get size() {
    return _.size(this)
  }
}
class Pixel {
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
        sizeInfo: `${this.state.pixels.compressed.length} -> ${this.state.pixels.compressedString.length}`
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
      pixels = new Pixels(LZString.decompress(storedPixels))
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






// SPIKE (Custom format): Rather than converting the object to/from JSON,
  // create a custom format to store the pixels. Maybe something simple:
  //
  //   'y:x.v,x.v ...'
  //
  //   '0:0.2,4.2,7:2 2:0:2'
  // Note: This proved to be slightly smaller in size, but the amount of extra code to support it
  //       is a downside overall. If I come back to custom storage formats, it'll probably be
  //       storing the canvas as an image and going from there.
  //   get formattedString() {
  //     var string = "";
  //     var lastY = -1;
  //     this.each((x, y, pixel) => {
  //       if (y > lastY) {
  //         string += ` ${y}:`
  //         lastY = y
  //       }
  //       string += `${x}.${pixel.value},`;
  //     });
  //     return _.trim(string, ", ").replace(/, /g, " ");
  //   }
  // constructor:
  //     } else if (_.isString(data)) {
  //       _.each(data.split(" "), (column) => {
  //         var [y, pixels] = column.split(":");
  //         _.each(pixels.split(","), (point) => {
  //           var [x, v] = point.split(".");
  //           this.addAt(x,y,v);
  //         })
  //       })
  //     }
