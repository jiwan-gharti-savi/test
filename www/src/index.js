
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-circular-progressbar/dist/styles.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css";
import "react-loading-skeleton/dist/skeleton.css";

// import Loader from './loader';
import appConfigs from "../src/config/appConfig.json";
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";
import TokenAuthenticator from "./components/Auth/TokenAuthenticator";
// import stytchConfig from "./stytch_config";
import generalConfig from "./utils/generalConfig.json";

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

let stytch;

let auth0Config;
let stytchConfig;
// let publickToken;

(async () => {
  auth0Config = appConfigs?.auth0;
  stytchConfig = appConfigs?.stytch;
  const providerConfig = {
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(auth0Config.audience ? { audience: auth0Config.audience } : null),
    },
  };

  if(stytchConfig?.publicToken && generalConfig?.authenticator === "stytch"){
    stytch = new StytchUIClient(stytchConfig?.publicToken);
  }
  
  

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <BrowserRouter>
    {generalConfig?.authenticator === "stytch" ? (
      <StytchProvider stytch={stytch}>
        <TokenAuthenticator>
          <Provider store={store}>
            <App />
            <ToastContainer />
          </Provider>
        </TokenAuthenticator>
      </StytchProvider>
    ) : (
      <Auth0Provider {...providerConfig}>
        <Provider store={store}>
          <App />
          <ToastContainer />
        </Provider>
      </Auth0Provider>
    )}
    </BrowserRouter>
  );

  reportWebVitals();
})();
