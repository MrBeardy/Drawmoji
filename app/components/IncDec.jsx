// React
import React from 'react';

export default class IncDec extends React.Component {
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
