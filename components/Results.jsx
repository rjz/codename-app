'use strict'

var React = require('react');

module.exports = class Results extends React.Component {
  render () {
    let resultItems = this.props.results.map((x) => {
      return <li>x</li>
    })
    return <ul>
      {resultItems}
    </form>
  }
}

