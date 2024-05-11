import React from "react";
import classes from "./AuthZero.module.css";

class AuthZero extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className = {classes.authCont} >
        <div className = {classes.content}  >
            <span>
            Empowering users with generative
            </span>
            <span>
            AI for IP solutions
            </span>
            <div className = {classes.buttons}>
                <button>Login</button>
                <button>Sign Up</button>
            </div>
        </div>
      </div>
    );
  }
}

export default AuthZero;
