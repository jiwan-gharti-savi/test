// PhoneNumberEntry.jsx

import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import backIcon from "../../assets/icons/black-back.svg";
import { useSelector } from "react-redux";
import PasswordChecklist from "react-password-checklist";
import image_login from "../../assets/icons/image_login.svg";
import { Container, Row, Col } from "reactstrap";
import "../Login.scss";

const PassReset = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const history = useHistory();
  const token = new URLSearchParams(window.location.search).get("token");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPassStrong, passwordStrong] = useState(false);
  const config = useSelector((state) => state.projectData);

  const showToast = async (message, info = false) => {
    let toastData = config?.config?.toasterStyle;
    toastData["autoClose"] = 2000;
    if (info) {
      toast.info(`${message}`, toastData);
    } else {
      toast.error(`${message}`, toastData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword && isPassStrong) {
      resetPassword();
    } else {
      showToast("Passwords do not match, please re-enter.");
    }
  };

  const resetPassword = async () => {
    try {
      let data = {
        token: token,
        password: password,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.auth_set_password,
        data: data,
      });

      console.log("BHANU==>", res);
      if (res?.data?.status === "Success") {
        showToast("Password reset successfully.", true);
        history.push("/auth");
      } else {
        showToast("Reset link expired. Please request another reset.");
      }
    } catch (e) {}
  };

  const backHandler = async () => {
    try {
      // if (user) {
      //   let logout = await stytch.session.revoke();
      // }
      localStorage.clear();
      history.replace("/auth");
    } catch (e) {
      console.log(e);
    }
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
                              <h3 className="login-heading mb-5">
                                Enter New Password
                              </h3>
                              <div className="form-group mt-3">
                                {/* <label>Phone Number</label> */}
                                <input
                                  className="form-control mt-1"
                                  placeholder="Enter new password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  type="password"
                                />
                              </div>
                              <div className="form-group mt-3 ">
                                <input
                                  className="form-control mt-1 mb-3"
                                  placeholder="Confirm new password"
                                  value={confirmPassword}
                                  onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                  }
                                  required
                                  type="password"
                                />
                                <div className="stytch-form-check">
                                  <PasswordChecklist
                                    rules={[
                                      "minLength",
                                      "specialChar",
                                      "number",
                                      "capital",
                                      "match",
                                    ]}
                                    minLength={14}
                                    value={password}
                                    valueAgain={confirmPassword}
                                    onChange={(isValid) => {
                                      passwordStrong(isValid);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="d-grid gap-2 mt-3 mb-3">
                                <button
                                  onClick={handleSubmit}
                                  type="button"
                                  className="btn stytch-login-buttons"
                                >
                                  Submit
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
    </>
  );
};

export default PassReset;
