import "./Login.css";
import React, { useEffect, useState } from "react";
import ".././Login.scss";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { updateToken, logIn, addUserName } from "../../../store/action";
import { Container, Row, Col } from "reactstrap";
import image_login from "../../assets/icons/image_login.svg";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import loadingGif from "../../assets/icons/loading.gif";

function Login(props) {
  const [password, setPassword] = useState("");
  const [loading, isLoading] = useState(false);
  const [user, setUser] = useState("");
  const [weakPassword, setWeakPassword] = useState(false);
  const history = useHistory();
  const config = useSelector((state) => state.projectData);
  const dispatch = useDispatch();
  const hashEmail = history.location.pathname.split("/").pop();
  const email = window.atob(hashEmail);

  useEffect(() => {
    const getUserData = async () => {
      isLoading(true);
      try {
        let data = {
          email: email,
        };
        const user = await axios({
          method: "post",
          url: config?.api_config?.endpoints?.auth_check_email,
          data: data,
        });
        isLoading(false);
        setUser(user?.data);
      } catch (e) {
        isLoading(false);
        console.log(e);
      }
    };

    getUserData();
  }, []);

  const SignUp = async (user) => {
    try {
      isLoading(true);
      let data = {
        role_id: 2,
        email: email,
        privilege_id: 2,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.signup,
        data: data,
      });

      isLoading(false);

      if (user?.status === "active") {
        let toastData = config?.config?.toasterStyle;
        toastData["autoClose"] = res["data"]["message_time"];
        toast.info(res["data"]["message"], toastData);
      }

      localStorage.setItem("user_id", res?.data?.response?.id);
      localStorage.setItem("token", res?.data?.response?.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role_id", res?.data?.response?.role_id);
      localStorage.setItem("email", email);

      let userName =
        user?.["first_name"] +
        " " +
        user?.["middle_name"] +
        " " +
        user?.["last_name"];
      localStorage.setItem("Username", userName);
      dispatch(logIn());
      dispatch(updateToken(res?.data?.response?.token));
      props.updateSession(true);
      dispatch(addUserName(userName));
    } catch (e) {
      console.log(e);
      isLoading(false);
    }
  };

  const loginHandler = async (e) => {
    e?.preventDefault();
    try {
      isLoading(true);
      let data = {
        email: email,
        password: password,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.auth_login,
        data: data,
      });

      isLoading(false);
      if (res?.data?.status === "Success") {
        if (user?.mfa === "email" || user?.mfa === "sms") {
          let userName =
            user?.["first_name"] +
            " " +
            user?.["middle_name"] +
            " " +
            user?.["last_name"];
          localStorage.setItem("sessionToken", res?.data?.session_token);
          const hashEmail =window.btoa(email);
          history.push(
            `/passcode/${hashEmail}/${user?.mfa}/${user?.user_status}?userName=${userName}`
          );
        } else {
          SignUp(user);
        }
      } else {
        if(res?.data?.message === 'reset password'){
          setWeakPassword(true);
        }else{
          let toastData = config?.config?.toasterStyle;
          toastData["autoClose"] = 1500;
          toast.error(
            `The entered password is incorrect. Please double-check your password and try again.`,
            toastData
          );
        }
      }
    } catch (e) {
      console.log(e);
      isLoading(false);
    }
  };

  const forgetPassHandler = async () => {
    isLoading(true);
    try {
      let data = {
        email: email,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.auth_reset_password,
        data: data,
      });
      isLoading(false);

      const hashEmail =window.btoa(email);
      if (res?.data?.status === "Success") {
        history.push(`/resetPass/${hashEmail}`);
      }
    } catch (e) {
      console.log(e);
      isLoading(false);
    }
  };

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
            <div className="stytch-passcode-cont">
              {loading && (
                <img
                  src={loadingGif}
                  alt="loading"
                  className="stytch-loading-gif"
                />
              )}
              <div className="row justify-content-center">
                <div className="stytch-card-container">
                  <div className="card">
                    <div className="card-body">
                      <div>
                        <form>
                          <div>
                            <h3 className="login-heading">Login</h3>
                            <div className="form-group mt-3">
                              <label>Email address</label>
                              <input
                                type="email"
                                className="form-control mt-1 py-2"
                                placeholder="Enter email"
                                value={email}
                                readOnly
                              />
                            </div>
                            <div className="form-group mt-3">
                              <label>Password</label>
                              <input
                                type="password"
                                className="form-control mt-1 py-2"
                                placeholder="Enter password"
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e?.code === "Enter" && !loading) {
                                    loginHandler(e);
                                  }
                                }}
                              />
                            </div>
                            <div className="form-group mt-2"></div>

                            <div className="d-grid gap-2 mt-3">
                              <button
                                onClick={() => {
                                  if (!loading) {
                                    loginHandler();
                                  }
                                }}
                                type="button"
                                className="btn stytch-login-buttons"
                                disabled={loading ? true : false}
                              >
                                Log In
                              </button>
                            </div>
                            <div className="forgot-password text-right mt-2">
                              <div
                                onClick={forgetPassHandler}
                                type="button"
                                className="forget-password-button"
                              >
                                {weakPassword ? 'Reset password' : "Forgot password?"}
                              </div>
                              {weakPassword &&<p className="m-0 mt-2">
                                 Your password is too weak. Please reset to stronger one to secure your account.
                              </p>}
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
