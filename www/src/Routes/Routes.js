import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import React from "react";
import Home from "../components/Container/Home/Home";
import PatentDetails from "../components/Container/patent/patentDetails";
import PatentDetailsEdit from "../components/Container/patent/patentDetailsEdit";
import Header from "../components/Container/Header/Header";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import OAuth from '../components/Auth/Auth';
import Logout from "../components/Auth/Logout";
import PriorArtTable from "../components/Container/PriorArt/priorArtTable";
import Claims from "../components/Container/PriorArt/claims";
import { updateToken} from "../store/action";
import { connect } from "react-redux";
import SessionVerification from "./SessionVerification";
import Login from "../components/Auth/Login";
import PassReset from "../components/Auth/Stytch/PassReset";
import PasscodeEntry from "../components/Auth/Stytch/PasscodeEntry";
import MagicLink from "../components/Auth/Stytch/MagicLink";
import UnauthorizedUser from "../components/Auth/Stytch/UnauthorizedUser";
import StytchLogin from "../components/Auth/Stytch/Login";
import VerifyEmail from "../components/Auth/Stytch/VerifyEmail";
import ResetLink from "../components/Auth/Stytch/ResetLink";
class Routes extends React.Component {
  constructor(props)
  {
    super(props)
    this.state={
      input : "",
      sessionVerificationDone: false,
      sessionAvaialble: false,
      isJWT:false,
      isRedirect:true,
    };
    this.jwt=false;
    this.isRedirect=true;
    this.inputValueHandler = this.inputValueHandler.bind(this)
  }
  inputValueHandler(value)
  {
    this.setState({input : value});
  }

  componentDidMount(){
    const isLoggedIn = localStorage.getItem("isLoggedIn");                
    if (isLoggedIn === "true") {
      this.setState({sessionAvaialble: true});
    }
    const token = localStorage.getItem("token");
    if(token){
      this.props.updateToken(token)
    }
    this.setState({sessionVerificationDone: true});
  }

  updateSession = (flag) => {
    this.setState({sessionAvaialble: flag});
  }

  tokenHandler = (isJWT) => {
    this.setState({ isJWT }); 
  };
  
  redirecthandler = (flag) =>{
    this.isRedirect=flag;
  }

 

  render() {

    const { sessionVerificationDone,  sessionAvaialble, isJWT } = this.state;
    let userId = localStorage.getItem("user_id");
    // const token = localStorage.getItem("token");
    if(userId !=null  && userId != undefined && userId != "undefined" ){
      userId = userId
    }else{
      userId ="";
    }

   
    return (<>
        <Router>
          {/* <Header updateSession={this.updateSession}></Header> */}
          <Route path = "/" render={(props) => <Header  updateSession = {this.updateSession}  {...props} /> } ></Route>
          {
             (
              (userId) ?
              <SessionVerification project={this.props.project} tokenHandler = {this.tokenHandler} redirecthandler = {this.redirecthandler} > 
                <Switch>
                <Route exact path = "/logout" render={(props) => <Logout/> } ></Route>
                <Route exact path="/home" render={(props) => <Home  updateSession={this.updateSession} inputValueHandler = {this.inputValueHandler}  {...props} />}></Route>
                <Route exact path="/priorArt/:id/:filterData?" render={(props) => <PriorArtTable {...props} />} ></Route>
                <Route exact path="/claims/:id/:new?" render={(props) => <Claims {...props} />} ></Route>
                <Route exact path="/patentDetails/:id/:new?" render={(props) => <PatentDetails inputValue = {this.state.input} {...props} />}></Route>
                <Route exact path="/patentDetails/:ID/edit/:id/:flowChart?/:flowChartID?" render={(props) => <PatentDetailsEdit {...props} />}></Route>
                {/* <Route exact path="/patentDetails/:ID/edit/:id/:new?/:imageId?" render={(props) => <Mermaid {...props} />}></Route> */}
                {/* <Route exact path="/patentDetails/:ID/edit/:id/:new?/:imageId?" render={(props) => <FlowChartRoot {...props} />}></Route> */}
                <Redirect to ='/home' />
              </Switch>
              </SessionVerification>
             : (this.props?.project?.config?.authenticator === 'stytch') ?
                <Switch>
                  <Route exact path="/auth/:check_session?" render={(props) => <VerifyEmail isRedirect={this.isRedirect} updateSession={this.updateSession} {...props} />}></Route>
                  <Route exact path="/auth" render={(props) => <VerifyEmail isRedirect={this.isRedirect} updateSession={this.updateSession} {...props} />}></Route>
                  <Route exact path="/passreset" render={(props) => <PassReset isRedirect={this.isRedirect} updateSession={this.updateSession}  {...props} />}></Route>
                  <Route exact path="/passcode/:passcodeEmail/:mfa?/:status?" render={(props) => <PasscodeEntry isRedirect={this.isRedirect} updateSession={this.updateSession}   {...props} />}></Route>
                  <Route exact path="/magiclink" render={(props) => <MagicLink isRedirect={this.isRedirect} updateSession={this.updateSession}   {...props} />}></Route>
                  <Route exact path="/unauthorized" render={(props) => <UnauthorizedUser isRedirect={this.isRedirect} updateSession={this.updateSession}   {...props} />}></Route>
                  <Route exact path="/login/:email?" render={(props) => <StytchLogin isRedirect={this.isRedirect} updateSession={this.updateSession}   {...props} />}></Route>
                  <Route exact path="/resetPass/:resetEmail?" render={(props) => <ResetLink isRedirect={this.isRedirect} updateSession={this.updateSession}   {...props} />}></Route>
                  <Redirect to ='/auth' />
              </Switch> : this.props?.project?.config?.authenticator === 'auth0' ?
              <Switch>
                <Route exact path="/auth/:check_session?" render={(props) => <OAuth isRedirect={this.isRedirect} updateSession={this.updateSession} {...props} />}></Route>
                <Route exact path="/auth" render={(props) => <OAuth isRedirect={this.isRedirect} updateSession={this.updateSession} {...props} />}></Route>
                <Redirect to ='/auth' />
              </Switch> : ""
            )
          }
        </Router>
        </>
    );
  }
}



const mapStateToProps = (state) => {
  return {
    token : state.authReducer.token,
    project: state.projectData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateToken: (data) => dispatch(updateToken(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Routes);


