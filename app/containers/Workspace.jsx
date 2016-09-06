
// React
import React from 'react';

// App
import IncDec from '../components/IncDec.jsx'
import Drawboard from './Drawboard.jsx'

export default class Workspace extends React.Component {
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
