import React, { useEffect, useState } from "react";
import { StytchLogin } from "@stytch/react";
import { Products } from "@stytch/vanilla-js";
import { useStytchUser } from "@stytch/react";
import "./Login.scss";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { updateToken, logIn, addUserName } from "../../store/action";
import { Container, Row, Col } from "reactstrap";
import image_login from "../assets/icons/image_login.svg";
import LoadingScreen from "../LoadingScreen/loadingScreen";

/*
Login configures and renders the StytchLogin component which is a prebuilt UI component for auth powered by Stytch

This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
https://stytch.com/docs/sdks/javascript-sdk#ui-configs
*/
const Login = (props) => {
  const { user } = useStytchUser();
  const dispatch = useDispatch();
  const config = useSelector((state) => state.projectData);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const styles = {
    buttons: {
      primary: {
        backgroundColor: "#073BB2",
        borderColor: "#073BB2",
        borderRadius: "5px",
      },
    },
    // hideHeaderText: true,
    container: {
      borderColor: "transparent",
      width: "35vw",
      // minWidth: "300px"
    },
    inputs: {
      borderColor: "transparent",
      backgroundColor: "rgb(170 170 170 / 20%)",
    },
  };
  const stytchConfig = {
    products: ["passwords", "emailMagicLinks"],
    passwordOptions: {
      loginRedirectURL: config?.api_config?.auth,
      resetPasswordRedirectURL: config?.api_config?.stytchReset,
      reset_password_template_id : "ipauthor_dev_reset_password"
    },
    emailMagicLinksOptions: {
      loginRedirectURL: config?.api_config?.magiclink,
      loginExpirationMinutes: 30,
      signupRedirectURL: config?.api_config?.magiclink,
      signupExpirationMinutes: 30,
      reset_password_template_id : "ipauthor_dev_reset_password"
    },
  };

  const SignUp = async (user) => {
    try {
      let data = {
        // firstName: user.nickname,
        // lastName: user.name,
        // company: 'dolcera',
        role_id: 2,
        email: user?.["emails"]?.[0]?.["email"],
        // password: 123,
        privilege_id: 2,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.signup,
        data: data,
      });

      if (user?.trusted_metadata?.status === "active") {
        let toastData = config?.config?.toasterStyle;
        toastData["autoClose"] = res["data"]["message_time"];
        toast.info(res["data"]["message"], toastData);
      }

      localStorage.setItem("user_id", res?.data?.response?.id);
      localStorage.setItem("token", res?.data?.response?.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role_id", res?.data?.response?.role_id);
      let userName =
        user?.["name"]?.["first_name"] +
        " " +
        user?.["name"]?.["middle_name"] +
        " " +
        user?.["name"]?.["last_name"];
      localStorage.setItem("Username", userName);
      dispatch(updateToken(res?.data?.response?.token));
      props.updateSession(true);
      dispatch(addUserName(userName));
      dispatch(logIn());
    } catch (e) {
      console.log(e);
    }
  };
  var element = document.querySelector(".fIXeKF");

  // Check if the element exists before updating its text
  if (element) {
    // Update the text content
    element.textContent = "Login";
  }

  useEffect(() => {
    let id = setInterval(() => {
      let element = document.querySelector(".fIXeKF");
      let stytchLogo = document.querySelector(".hVjCUd");
      if (element) {
        element.textContent = "Login";
      }
      if(stytchLogo){
        stytchLogo.style.display = "none"; 
      }
    }, 5);

    return () => {
      clearInterval(id);
    };
  }, [element]);



  if (user?.user_id) {
    if (
      user?.["trusted_metadata"]?.["MFA"] === "email" ||
      user?.["trusted_metadata"]?.["MFA"] === "sms"
    ) {
      history.push("/passcode");
    } else {
      SignUp(user);
    }
  } else {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center stytchlogin-cont"
      >
        <Row className="stytch-row-container">
          <Col className="d-none d-lg-block">
            <div className="stytch-login-container ">
              <img src={image_login} alt="login" className="login-image" />
            </div>
          </Col>
          <Col className="d-flex align-items-center justify-content-center ">
            <div className="stytch-login-container stytch-white-background ">
              <StytchLogin config={stytchConfig} styles={styles} />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return <LoadingScreen />;
};

export default Login;
