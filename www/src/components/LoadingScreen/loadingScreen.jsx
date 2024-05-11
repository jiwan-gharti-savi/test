import React, { Component } from 'react';
import loading_icon from "../assets/icons/loading.gif";

class LoadingScreen extends Component {
    constructor(props)  {
        super(props)
    }
    
    render() {
        return (
            <div className= {`loading-home-main`}>
                <img src={loading_icon} alt='loading_icon' className= {`loading_icon  ${this.props.className}`}  /> 
            </div>
        );
    }
}

export default LoadingScreen;