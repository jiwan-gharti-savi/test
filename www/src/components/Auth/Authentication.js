import React from "react";
import classes from "./Authentication.module.css";
import CryptoJS from "crypto-js";
import axios from "axios";
import { connect } from "react-redux";
import { addProjectId, addUserId, logIn } from "../../store/action";
import { toast } from 'react-toastify';

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      companyName: "",
      setSign: "login",
      signupMessage: "",
      isSignupError: false,
      loginMessage: "",
      isLoginError: false,
      sysuserMessage: "",
      isSysuserError: false,
      toaster: false,
      toasterMessage: "",
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.authToggleHandler = this.authToggleHandler.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      this.props.history.push("/home");
    }
  }

  handleInputChange(event) {
    const { id, value } = event.target;
    this.setState({ [id]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      companyName: "",
    });
  }

  updateData() {
    const thisView = this;
    const text = this.state.password;
    let salt = "";
    for (let i = 0; i < text.length; i++) {
      salt += "aZ@9#e$X^y&@!5*h(Nc1KpL8w" + text.charCodeAt(i) * (i - 7);
    }
    const combined = text + salt;
    const hash = CryptoJS.SHA256(combined).toString();

    if (this.state.setSign == "signup") {
      axios
        .post(this.props.project?.api_config?.endpoints?.signup, {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          company: this.state.companyName,
          email: this.state.email,
          password: hash,
        })
        .then((response) => {
          if (response["data"]["status"] === "Success") {
            let toastData = this.props.project?.config?.toasterStyle;
            toastData["autoClose"] = response["data"]["message_time"];
            toast.success(response["data"]["message"], toastData);

            this.setState({ setSign: "login" });
          } else if (response["data"]["status"] === "Error") {
            this.setState({ isSignupError: true });
            let toastData = this.props.project?.config?.toasterStyle;
            toastData["autoClose"] = response["data"]["message_time"];
            toast.error(response["data"]["message"], this.props.project?.config?.toasterStyle);
          }
          this.setState({ signup_message: response["data"]["message"] });
        })
        .catch((error) => {
          this.setState({
            isSignupError: true,
            signup_message: `Unable to process the request. Please try again later: ${error}`,
          });
        });
    } else {
      axios
        .post(this.props.project?.api_config?.endpoints?.login, {
          email: this.state.email,
          password: hash,
        })
        .then((response) => {
          if (response["data"]["status"] == "Success") {
            const user_id = response["data"]["response"]["sysuser_id"];
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem(
              "user_id",
              response.data["response"]["sysuser_id"]
            );
            localStorage.setItem("user_id", response.data["response"]["sysuser_id"]);
            toast.success(response["data"]["message"], this.props.project?.config?.toasterStyle);
            this.props.login();
            // this.props.history.push("/home");
            thisView.props.updateSession(true);
          } else if (response["data"]["status"] === "Error") {
            this.setState({ isLoginError: true });
            toast.error(response["data"]["message"], this.props.project?.config?.toasterStyle);
          }
          // this.props.login();
          this.setState({ loginMessage: response["data"]["message"] });
        })
        .catch((error) => {
          this.setState({
            isLoginError: true,
            loginMessage:
              "Please check email and password, Please try again later: ${error}",
          });
        });
    }
  }

  authToggleHandler() {
    if (this.state.setSign == "login") {
      this.setState({ setSign: "signup" });
    } else {
      this.setState({ setSign: "login" });
    }
  }

  render() {
    const { toggleAuth: auth } = this.props;
    return (
      <div>
        <main className={classes.main}>
          <div className={classes.left}></div>
          <div className={classes.right}>
            <div className={classes.rightCont}>
              <h1>Welcome to Dolcera IP ChatGPT</h1>
              <p>{this.state.setSign == "signup" ? "Signup" : "Login"}</p>
              <form className={classes.form} onSubmit={this.handleSubmit}>
                {this.state.setSign == "signup" && (
                  <label for="firstName">First Name</label>
                )}
                {this.state.setSign == "signup" && this.state.setSign && (
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    value={this.state.firstName}
                    onChange={this.handleInputChange}
                  ></input>
                )}
                {this.state.setSign == "signup" && (
                  <label for="lastName">Last Name</label>
                )}
                {this.state.setSign == "signup" && this.state.setSign && (
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    value={this.state.lastName}
                    onChange={this.handleInputChange}
                  ></input>
                )}
                {this.state.setSign == "signup" && (
                  <label for="companyName">Company Name</label>
                )}
                {this.state.setSign == "signup" && this.state.setSign && (
                  <input
                    type="text"
                    id="companyName"
                    placeholder="Company Name"
                    value={this.state.companyName}
                    onChange={this.handleInputChange}
                  ></input>
                )}
                <label for="email">E mail</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                ></input>
                <label for="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleInputChange}
                ></input>
                <button onClick={this.updateData}>
                  {this.state.setSign == "signup" ? "Sign up" : "Login"}
                </button>
                <div className={classes.toggleSignup}>
                  <span>
                    {this.state.setSign == "signup"
                      ? "Already Registered?"
                      : "Don't have account?"}
                  </span>
                  <span onClick={() => this.authToggleHandler()}>
                    {this.state.setSign == "signup" ? " Login" : "Sign Up"}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  project: state.projectData,
});

const mapDispatchToProps = (dispatch) => {
  return {
    addUserId: (data) => dispatch(addUserId(data)),
    login: () => dispatch(logIn()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
