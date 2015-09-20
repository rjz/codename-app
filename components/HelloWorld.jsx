'use strict'

var React = require('react');

module.exports = class HelloWorld extends React.Component {
  render () {
    return <form action="/api/codenames">
      <h1>Hello {this.props.name}</h1>
      <input type="hidden" name="lists" value="colors,cities,animals" />
      <input type="hidden" name="filters" value="alliterative,random" />
      <input type="submit" value="Get 'em" />
    </form>
  }
}

