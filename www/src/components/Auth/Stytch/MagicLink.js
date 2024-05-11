import React, { useEffect, useState } from "react";
import { useStytchUser, useStytch } from "@stytch/react";
import { Link, useHistory } from "react-router-dom/";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import backIcon from "../../assets/icons/black-back.svg";
import image_login from "../../assets/icons/image_login.svg";
import { Container, Row, Col } from "reactstrap";
import "../Login.scss";

const MagicLink = () => {
  const { user } = useStytchUser();
  const stytch = useStytch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  const revokeHandler = async (redirect = false) => {
    try {
      if (user) {
        let logout = await stytch.session.revoke();
      }

      if (redirect) {
        history.replace("/auth");
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    revokeHandler();
  }, []);

  if (loading) {
    return <LoadingScreen />;
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
              <div className="stytch-passcode-cont">
                <div className="row justify-content-center">
                  <div className="stytch-card-container">
                    <div className="card">
                      <div className="card-body">
                        <div>
                          <form>
                            <div>
                              <div className="col  mb-4  stytch-back-arrow-container "></div>
                              <h3 className="login-heading mb-5">
                                Please utilize the <b>Reset Password</b>  button in
                                your email, as login without a password is not
                                supported.
                              </h3>

                              <div className="d-grid gap-2 mt-3 mb-3">
                                <button
                                  onClick={() => revokeHandler(true)}
                                  type="button"
                                  className="btn stytch-login-buttons"
                                >
                                  Login
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
};

export default MagicLink;
