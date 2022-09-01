import React from "react";

import styles from "./Component.module.css";

export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clicked: false
    };
  }

  handleClick = () => {
    this.setState(state => ({ clicked: !state.clicked }));
  };

  render() {
    return (
      <button onClick={this.handleClick} className={styles.button}>
        {this.state.clicked ? "Clicked" : "Please Click Me"}
      </button>
    );
  }
}
