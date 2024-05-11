import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom/";
import backIcon from "../../assets/icons/black-back.svg";
import image_login from "../../assets/icons/image_login.svg";
import { updateToken, logIn, addUserName } from "../../../store/action";
import { Container, Row, Col } from "reactstrap";
import "../Login.scss";
import loadingGif from "../../assets/icons/loading.gif";

const PasscodeEntry = (props) => {
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [key, setKey] = useState("");
  const [timer, setTimer] = useState(0); // 2 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const config = useSelector((state) => state.projectData);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get('userName') || '';
  const [loading, setLoading] = useState(false);

  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  const hashEmail = history.location.pathname.split("/")[2];
  const email = window.atob(hashEmail);
  const mfa = history.location.pathname.split("/")[3];
  const userStatus = history.location.pathname.split("/")[4];

  const handleChange = (index, value) => {
    // If the entered value is more than one digit, take only the last digit

    // Check if the entered value contains only numeric characters
    if (/^\d*$/.test(value)) {
      const newPasscode = [...passcode];
      newPasscode[index] = value.slice(-1);
      setPasscode(newPasscode);

      // Move focus to the next input
      if (value !== "" && index < inputRefs.length - 1) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData("Text");

    // Extract only numeric characters from the pasted data
    const numericChars = pastedData.match(/\d/g);

    // Update the passcode array by filling each position with the respective numeric character
    const updatedPasscode = Array.from({ length: inputRefs.length }, (_, i) =>
      numericChars && numericChars[i] ? parseInt(numericChars[i], 10) : ""
    );

    setPasscode(updatedPasscode);
  };

  const handleBackspace = (index, value) => {
    // Move focus to the previous input when backspace is pressed
    if (value === "" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const startTimer = () => {
    setResendDisabled(true);
    setTimer(120); // Reset timer to 2 minutes
  };

  useEffect(() => {
    resendhandler();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(countdown);
          setResendDisabled(false);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const SignUp = async () => {
    try {
      let data = {
        // firstName: user.nickname,
        // lastName: user.name,
        // company: 'dolcera',
        role_id: 2,
        email: email,
        // password: 123,
        privilege_id: 2,
      };

      const res = await axios({
        method: "post",
        url: config?.api_config?.endpoints?.signup,
        data: data,
      });


      if(userStatus === 'active'){
        let toastData = config?.config?.toasterStyle;
        toastData["autoClose"] = res["data"]["message_time"];
        toast.info(res["data"]["message"], toastData);
      }

      localStorage.setItem("user_id", res?.data?.response?.id);
      localStorage.setItem("token", res?.data?.response?.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role_id", res?.data?.response?.role_id);
      localStorage.setItem("Username", userName);
      localStorage.setItem("email", email);
      dispatch(logIn());
      dispatch(updateToken(res?.data?.response?.token));
      props.updateSession(true);
      dispatch(addUserName(userName));
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const formattedPasscode = passcode.join("");
      //   onSubmit(formattedPasscode);
      let data = {
        key: key,
        code: formattedPasscode,
      };
      const response = await axios({
        method: "post",
        url: config.api_config.endpoints.auth_validate_2fa,
        data: data,
      });

      setPasscode(["", "", "", "", "", ""]);

      if (response?.["data"]?.["status"] === "Success") {
        // window.location.reload(true);
        SignUp();
      } else {
        let toastData = config?.config?.toasterStyle;
        toastData["autoClose"] = 1500;
        toast.error(`"Invalid passcode entered. Please check your ${mfa === 'email' ? 'email' : 'sms'} for the correct code."`, toastData);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const resendhandler = async () => {
    try {
      if (userStatus === 'active') {
        let data = {};
        let endPoint;

        if (mfa === "sms") {
          endPoint = "auth_request_2fa_sms";
          data.email =email;
        } else if (mfa === "email") {
          endPoint = "auth_request_2fa";
          data.email = email;
        }

        const fetchPasscode = async () => {
          const response = await axios({
            method: "post",
            url: config.api_config.endpoints[endPoint],
            data: data,
          });
          setKey(response?.["data"]?.["key"]);
        };

        fetchPasscode();
        startTimer();
      } else {
        history.replace("/auth");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const backHandler = async () => {
    try {
      // let logout = await stytch?.session?.revoke();
      localStorage.clear();
      const hashEmail = window.btoa(email);
      history.replace(`/login/${hashEmail}`);
    } catch (e) {
      console.log(e);
      localStorage.clear();
      const hashEmail = window.btoa(email);
      history.replace(`/login/${hashEmail}`);
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
            <div className="stytch-passcode-cont ">
            {loading && <img src={loadingGif} alt="loading" className="stytch-loading-gif" /> }
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
                            <h3 className="login-heading mb-5">{`Enter passcode sent to your registered ${
                              mfa === "email"
                                ? "email"
                                : "phone number"
                            } `}</h3>
                            <div className="form-group mt-3">
                              {/* <label>Passcode</label> */}

                              <div className="passcode-input-container">
                                {passcode.map((digit, index) => (
                                  <input
                                    key={index}
                                    type="tel"
                                    pattern="[0-9]*"
                                    value={digit}
                                    onChange={(e) =>
                                      handleChange(index, e.target.value)
                                    }
                                    onPaste={handlePaste}
                                    onKeyDown={(e) =>
                                      e.key === "Backspace" &&
                                      handleBackspace(index, digit)
                                    }
                                    className="form-control mt-1 hideArrows"
                                    //   placeholder="Enter passcode"
                                    ref={inputRefs[index]}
                                    required
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="resend-container mt-1">
                              {timer > 0 ? (
                                <p>Resend in: {formatTime(timer)}</p>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-link"
                                  onClick={resendhandler}
                                  disabled={resendDisabled}
                                >
                                  Resend
                                </button>
                              )}
                            </div>
                            <div className="d-grid gap-2 mt-3 mb-3">
                              <button
                                type="button"
                                onClick={handleSubmit}
                                className="btn  stytch-login-buttons stytch-button-hover"
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
  );
};

export default PasscodeEntry;
