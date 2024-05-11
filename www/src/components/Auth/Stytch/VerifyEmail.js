import { Button, Stack } from "react-bootstrap";
import "./Login.css";
import React, { useEffect, useState } from "react";
import ".././Login.scss";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Row, Col } from "reactstrap";
import image_login from "../../assets/icons/image_login.svg";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import loadingGif from "../../assets/icons/loading.gif";

function VerifyEmail(props) {
  const [email, setEmail] = useState("");
  const [loading, isLoading] = useState("");
  const history = useHistory();
  const config = useSelector((state) => state.projectData);

  const emailSubmitHandler = async (e) => {
    e?.preventDefault();
    isLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      // If the entered email format is incorrect
      let toastData = config?.config?.toasterStyle;
      toastData["autoClose"] = 1500;
      toast.error(`Please enter a valid email address.`, toastData);
      isLoading(false);
      return;
    }
    try {
      let data = {
        email: email,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.auth_check_email,
        data: data,
      });

      setEmail("");

      if (res?.data?.status === "Success") {
        if (res?.data?.is_reset_password_need) {
          const forgetPassHandler = async () => {
            // isLoading(true);
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
          forgetPassHandler();
        } else {
          const hashEmail = window.btoa(email);
          history.push(`/login/${hashEmail}`);
        }
      } else {
        history.replace("/unauthorized");
      }
      isLoading(false);
    } catch (e) {
        isLoading(false);
      history.replace("/unauthorized");
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
               {loading && <img src={loadingGif} alt="loading" className="stytch-loading-gif" /> }
              <div className="row justify-content-center">
                <div className="stytch-card-container">
                  <div className="card">
                    <div className="card-body">
                      <div>
                        <form>
                          <div>
                            <h3 className="login-heading jyTevX">
                              <b>Login</b>
                            </h3>
                            <div className="form-group mt-5">
                              <input
                                type="email"
                                className="form-control mt-1 py-2"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e?.code === "Enter") {
                                    emailSubmitHandler(e);
                                  }
                                }}
                                required="on"
                                autoComplete="on"
                              />
                            </div>
                            <div className="d-grid gap-2 mt-3">
                              <button
                                onClick={emailSubmitHandler}
                                type="button"
                                className="btn stytch-login-buttons"
                                disabled={loading ? true : false}
                              >
                                Continue with email
                              </button>
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

export default VerifyEmail;
