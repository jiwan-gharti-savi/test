import React from "react";
import "./Toaster.css";

class Toaster extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div style={{backgroundColor : this.props.color}} className = {`toaster-container toaster-color ${this.props.toaster ? 'toaster-on' : ''}`} >
                <p className="toaster-content" style={{color : this.props.color == 'green'? 'white' :'black' }} >{this.props.message}</p>
            </div>
        )
    }
}
export default Toaster