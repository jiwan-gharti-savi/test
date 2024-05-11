import React from "react";
import Routes from "./Routes/Routes";
import { Container } from "reactstrap";
import "./App.css";
import { connect } from "react-redux";
import {
  addConfig,
  addApiConfig,
  addUserId,
  contactDetails,
  addMermaidConfig,
  addExpectedTimeOut,
  addTimerMessages,
  addCountries,
  templateSwitch,
  toasterTime,
  featureAccess
  
} from "./store/action";
import apiConfigs from "./utils/api.json";
import generalConfig from "./utils/generalConfig.json";
import appConfig from "../src/config/appConfig.json";
import axios from 'axios';
import './common.scss'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readingConfigDone: false,
      combiningApiEndPointsDone: false,
    };
  }
  componentDidMount() {
    this.getConfig();
    window.favloader.init();
  }

  getConfig = async () => {
    try {
      var thisView = this;
      let config = {...generalConfig, ...appConfig};

      // updating redux with application configuration
      thisView.props.addConfig(config);
      thisView.setState({ readingConfigDone: true });

      // updating redux with apis endpoints

      let apis = apiConfigs;
      let baseUrl = config.baseUrl;
      let endPoints = apiConfigs?.endpoints ? apiConfigs?.endpoints : "";
      if (apiConfigs && endPoints) {
        Object.keys(endPoints).map((eachKey) => {
          endPoints[eachKey] = baseUrl + "/" + endPoints[eachKey];
        });
      }

      window.mermaid.initialize(apis.mermaid);
      thisView.props.addApiConfig(apis);
      thisView.props.addContact(apis.contacts);
      thisView.props.addMermaid(apis.mermaid);
      thisView.props.addExpectedTimeOut(apis.expected_time_out);
      thisView.props.addTimerMessages(apis.timer_messages);
      thisView.props.addCountries(apis.countries);
      thisView.props.templateSwitch(apis.template);
      thisView.props.addToasterTime(apis.toaster_time);
      // thisView.props.featureAccess(apis.features);
      thisView.setState({ combiningApiEndPointsDone: true });
    } catch (e) {
      console.log("An error occurred config in appjs");
    }
  };

  render() {
    return (
      <Container fluid className="App">
        {this.state.readingConfigDone &&
          this.state.combiningApiEndPointsDone && (
            <>
              <Routes></Routes>
            </>
          )}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addConfig: (data) => dispatch(addConfig(data)),
    addApiConfig: (data) => dispatch(addApiConfig(data)),
    addUserId: (data) => dispatch(addUserId(data)),
    addContact: (data) => dispatch(contactDetails(data)),
    addMermaid: (data) => dispatch(addMermaidConfig(data)),
    addExpectedTimeOut: (data) => dispatch(addExpectedTimeOut(data)),
    addTimerMessages: (data) => dispatch(addTimerMessages(data)),
    addCountries: (data) => dispatch(addCountries(data)),
    templateSwitch: (data) => dispatch(templateSwitch(data)),
    featureAccess: (data) => dispatch(featureAccess(data)),
    addToasterTime: (data) => dispatch(toasterTime(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
