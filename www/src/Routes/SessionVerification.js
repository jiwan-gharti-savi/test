import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logOut, logIn } from "../store/action";
import { useHistory } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen/loadingScreen";
import { fetchUserRoles } from "../store/slices/roleCheck";

//auth0
import apiServices from "../services/apiServices";
import { useAuth0 } from "@auth0/auth0-react";

const SessionVerification = (props) => {
  const dispatch = useDispatch();
  const [sessionVerified, setSessionVerified] = useState(false);
  const [loading, isLoading] = useState(false);
  const [stytchUser, setUser] = useState(false);
  const history = useHistory();
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();


  const logoutHandler =()=>{
    try{
      localStorage.clear();
        dispatch(logOut());
        props.redirecthandler(false);
        props.tokenHandler(false);
        isLoading(false);
        history.replace("/unauthorized");
    }catch(e){
      console.log(e);
    }
  }

  const checkAccess = async () => {
    try {
      if (stytchUser !== "unauthorized") {
        setSessionVerified(true);
        props.tokenHandler(true);
        props.redirecthandler(true);
        let userName =
          stytchUser?.["first_name"] +
          " " +
          stytchUser?.["middle_name"] +
          " " +
          stytchUser?.["last_name"];
        localStorage.setItem("Username", userName);
        isLoading(false);
      } else {
        logoutHandler();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const verifyingByStytch = async()=>{
    try{
      isLoading(true);

      let userRoleEmail = localStorage.getItem("email");
      let userRoleEndPoint =
        props.project?.api_config?.endpoints?.auth_check_email;
      let verifySessionEndpoint =
        props.project?.api_config?.endpoints?.verify_session;

      let roleCheckToBackend =
        props.project?.api_config?.endpoints?.role_check_to_access;

      await dispatch(
        fetchUserRoles({
          userRoleEmail,
          userRoleEndPoint,
          verifySessionEndpoint,
          roleCheckToBackend
        })
      )
        .unwrap()
        .then(async (stytchUser) => {
          try {
            setUser(stytchUser);
          } catch (e) {
            console.log(e);
          }
        });
    }catch(e){
      console.log(e);
    }
  }

  const verifyingByAuth0 = async()=>{
    try{
      let jwt = await apiServices.getData(
        "post",
        props.project?.api_config?.endpoints?.verify_session
      );
      if (jwt && jwt.status === "Success") {
        setSessionVerified(true);
        props.tokenHandler(true);
        props.redirecthandler(true);
      } else {
        localStorage.clear();
        props.redirecthandler(false);
        logout();
        props.tokenHandler(false);
      }
    }catch(e){
      console.log(e);
      localStorage.clear();
      props.redirecthandler(false);
      logout();
      props.tokenHandler(false);
    }
  }

  useEffect(() => {
    const verifySession = async () => {
      try { 
        if(props?.project?.config?.authenticator === 'stytch'){
          verifyingByStytch();
        }else{
          verifyingByAuth0();
        }
       
      } catch (e) {
        console.log(e);
      }
    };

    if (localStorage.getItem("token")) {
      verifySession();
    } else {
      logOut();
      if(props?.project?.config?.authenticator === 'stytch'){
        logoutHandler();
      }else{
        localStorage.clear();
        props.redirecthandler(false);
        props.tokenHandler(false);
      }
     
    }
  }, []);


  useEffect(() => {
    if (stytchUser) {
      checkAccess();
    }
  }, [stytchUser]);


  if (loading) {
    return <LoadingScreen />;
  } else {
    return <>{sessionVerified && props.children}</>;
  }
};

export default SessionVerification;
