import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import classes from "./AuthZero.module.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {updateToken, logIn ,addUserName } from "../../store/action";
import { useHistory } from "react-router-dom";
import LoadingScreen from "../LoadingScreen/loadingScreen";
import { toast } from 'react-toastify';


const OAuth = (props) => {
  const { user, isAuthenticated, loginWithRedirect, logout, loginWithPopup, isLoading,getAccessTokenSilently } =
    useAuth0();
  const history = useHistory();

  const config = useSelector((state) => state.projectData);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true)

  let check_session = props?.match?.params?.check_session;

  var isAuthCount = 0;
  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  if (isAuthenticated) {
    props.updateSession(true);
  }


  useEffect(() => {
    if (isAuthenticated && props.isRedirect) {
      axios
        .post(config?.api_config?.endpoints?.signup, {
          // firstName: user.nickname,
          // lastName: user.name,
          // company: 'dolcera',
          role_id : 2,
          email: user.email,
          // password: 123,
          privilege_id: 2,
        })
        .then((res) => {
          let toastData = config?.config?.toasterStyle;
          toastData["autoClose"] = res["data"]["message_time"];
          toast.info(res["data"]["message"], toastData);
          localStorage.setItem("token", res?.data?.response?.token);
          let id = res.data.response.id;
          let role_id = res.data.response.role_id;
          localStorage.setItem("user_id", id);
          localStorage.setItem("role_id",role_id);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("Username", user?.nickname);
          dispatch(updateToken(res?.data?.response?.token));
          dispatch(logIn());
          props.updateSession(true);
          let name = user?.nickname;
          dispatch(addUserName(name));
          // isLoading(true)
        })
        .catch((e) => {
          console.log(e);
          // isLoading(false)
        });
    } else {
      // isLoading(false);
    }
   
  }, [isAuthenticated]);

  
  useEffect(()=>
  {
    setLoading(true);
    setTimeout(()=>
    {
      setLoading(false);
    },1000)
  },[])

  // checking if the redirection is happening from web application initiating login to get session tokens
  useEffect(() => {

    if(!isAuthenticated && check_session == "yes"){
      loginWithRedirect({
        authorizationParams: { screen_hint: "login" , scope: 'read:roles'},
        scope: 'read:roles'
      });
    }

  }, [])


// useEffect(()=>{
//   logout();
// },[])

  return (
    <>
      {(isLoading || loading || check_session == "yes") ? (
        <LoadingScreen/>
      ) : (
        <div className={classes.authCont}>
          <div className={classes.content}>
            <span>Empowering users with generative</span>
            <span>AI for IP solutions</span>
            <div className={classes.buttons}>
              <button
                className="auth0_login_button"
                onClick={() => {
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "login" , scope: 'read:roles'},
                    scope: 'read:roles'
                  });
                }}
              >
                Login
              </button>
              <button
                onClick={() => {
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "signup" },
                  });
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OAuth;
