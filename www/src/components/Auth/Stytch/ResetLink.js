import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import backIcon from "../../assets/icons/black-back.svg";
import { useSelector } from "react-redux";
import image_login from "../../assets/icons/image_login.svg";
import { Container, Row, Col } from "reactstrap";
import "../Login.scss";

const ResetLink = ({ onSubmit }) => {
  const history = useHistory();
  const token = new URLSearchParams(window.location.search).get("token");
  const config = useSelector((state) => state.projectData);

  const hashEmail = history.location.pathname.split("/").pop();
  const email =  window.atob(hashEmail);

  const showToast = async (message) => {
    let toastData = config?.config?.toasterStyle;
    toastData["autoClose"] = 2000;
    toast.info(`${message}`, toastData);
  };

 
  const backHandler = async () => {
    try {
      history.goBack();
    } catch (e) {
      console.log(e);
    }
  };


  const resendHandler = async () => {
    try {
      let data = {
        email: email,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.auth_reset_password,
        data: data,
      });

      if (res?.data?.status === "Success") {
        showToast("Email sent successfully");
      }
    } catch (e) {}
  };

  return (
    <>
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
                <div className="row justify-content-center">
                  <div className="stytch-card-container">
                    <div className="card">
                      <div className="card-body">
                        <div>
                          <form>
                            <div>
                              <div className="col  mb-4  stytch-back-arrow-container ">
                                <img
                                  className="passcode-back"
                                  onClick={() => backHandler()}
                                  src={backIcon}
                                  alt="back"
                                />
                              </div>
                              <h3 className=" mb-4">
                                <b>Login</b>
                              </h3>
                              <div className="form-group mt-3">
                                {/* <label>Phone Number</label> */}
                                <p>
                                  {`A link to reset your password was sent to `}
                                  <b>{email}</b>.
                                </p>
                              </div>
                              <div className="form-group mt-3 ">
                                <p>
                                  Didn't get it? <b  type="button" onClick={resendHandler} > Resend email</b>
                                </p>
                                <div className="stytch-form-check"></div>
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
    </>
  );
};

export default ResetLink;
