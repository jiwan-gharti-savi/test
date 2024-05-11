import React, { useEffect } from "react";
import './textError.css'
class TextError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ show: false });
    }, 15000);
  }

  render() {
    const { errorMessage } = this.props;
     const { show } = this.state;
    if (!show) return null;
    return (
      <div>
        <span className="text-error">
          {errorMessage}
        </span>
      </div>
    );
  }
}

export default TextError;
