import React, { useState, useEffect, Fragment, useRef } from "react";
import axios from "axios";
import "./Header.scss";
import { Link, useHistory } from "react-router-dom/";
import { useSelector, useDispatch } from "react-redux";
import logout_icon from "../../assets/icons/logout.svg";
import triangle_down_blue_icon from "../../assets/icons/triangle_down_blue.svg";
import user_fill_icon from "../../assets/icons/user_fill.svg";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { Container, Row, Col } from "reactstrap";
import us_flag from "../../assets/icons/US_flag.svg";
import germany_flag from "../../assets/icons/germany.svg";
import telephone_icon from "../../assets/icons/telephone.svg";
import ip_logo from "../../assets/icons/IP_Author_logo.svg";
import home from "../../assets/icons/home.svg";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import generalConfig from "../../../utils/generalConfig.json"

const Header = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPorfileEnable, setIsPorfileEnable] = useState(false);
  const [userName, setUserName] = useState("");
  const [isContacts, setContacts] = useState(false);
  const [nameOnHeader, setNameOnHeader] = useState("");
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  let location = useLocation();
  const history = useHistory();
  const login = useSelector((state) => state.authReducer.login);
  const dispatch = useDispatch();
  const project = useSelector((state) => state.projectData);
  const user_Name = useSelector((state) => state.projectData.userName);

  const logoutStytchHandler=async()=>{
    try{
      let data = {
        session_token: localStorage.getItem("sessionToken"),
      };

      const user = await axios({
        method: "post",
        url: project?.api_config?.endpoints?.auth_logout,
        data: data,
      });

      props.updateSession(false);
      localStorage.setItem("isLoggedIn", "false");
      localStorage.clear();
      dispatch({ type: "LOGOUT" });
      history.replace("/auth");
    } catch (e) {
      props.updateSession(false);
      localStorage.setItem("isLoggedIn", "false");
      localStorage.clear();
      dispatch({ type: "LOGOUT" });
      history.replace("/auth");
      console.log(e);
    }
  }


  const auth0LogoutHandler = async () => {
    try {
      props.updateSession(false);
      logout({
        logoutParams: {
          returnTo: window.location.origin + "/logout",
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const authToggleHandler = async () => {
        if(generalConfig?.authenticator === 'stytch'){
          logoutStytchHandler();
        }else{
          auth0LogoutHandler();
        }
    }

  const toggleProfileSelection = (event) => {
    event.stopPropagation();
    setIsPorfileEnable(!isPorfileEnable);
  };

  const handleClickOutside = (event) => {
    setIsPorfileEnable(false);
    setContacts(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  useEffect(() => {
    let storageData = localStorage.getItem("isLoggedIn");
    let username = localStorage.getItem("Username");
    setUserName(username);

    if (storageData) {
      dispatch({ type: "LOGIN" });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  useEffect(() => {
    let username = localStorage.getItem("Username");
    const userNameTwoLetters = getFirstTwoCharsInUppercase(
      username ? username : user_Name
    );
    setNameOnHeader(userNameTwoLetters);
  }, [user_Name]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const goBackToHome = () => {
    // history.goBack()
    history.push("/home");
  };

  const toggleContactsHandler = (event) => {
    event.stopPropagation();
    setContacts(!isContacts);
  };

  const getFirstTwoCharsInUppercase = (inputString) => {
    const firstTwoChars = inputString.slice(0, 2);
    const uppercaseChars = firstTwoChars.toUpperCase();
    return uppercaseChars;
  };
  const handleChange = (checked) => {
    let lang = "";
    if (checked) {
      lang = "Europe";
    } else {
      lang = "US";
    }
    props.handleLanguageChange(lang);
  };

  return (
    <Container fluid className="header-container">
      <Navbar
        className={
          location["pathname"] == "/home"
            ? "Header white-header"
            : "Header blue-header"
        }
        expand="md"
      >
        <NavbarBrand className="header-left-block">
          <div
            className="header-logo-section"
            onClick={() => {
              goBackToHome();
            }}
          >
            <img className="header-logo-section-dolcera-logo" src={ip_logo} alt="logo" />
            <NavLink to="/home">
              <span
                className={
                  location["pathname"] == "/home"
                    ? "header-title .dark-title"
                    : "header-title white-title"
                }
              >
                Dolcera IP Author
              </span>
            </NavLink>
          </div>
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar className="navbar-items">
          <>
            {login && location?.pathname.split("/")?.[1] !== "home" && (
              <div className="header-home-cont">
                <span onClick={() => goBackToHome()} className={"header-home"}>
                  {/* <img className="contact_u" src={support_icon} /> */}
                  <img className="home-icon" src={home} />{" "}
                  <span className="home-text">Home</span>
                </span>
              </div>
            )}
            {login && (
              <>
                <div
                  onClick={(e) => toggleContactsHandler(e)}
                  className="ah_profile_main"
                >
                  <span className={"ah_each_option profile"}>
                    {/* <img className="contact_u" src={support_icon} /> */}
                    <img className="telephone" src={telephone_icon} />{" "}
                    <span className="help">Help</span>
                  </span>

                  {isContacts && (
            <div className="ah_eop_details_info">
              <img src={triangle_down_blue_icon} alt="triangle down" />
              <div className="aheopd_name_info">
                <div className="contact-name-cont">
                  <span>Contact Us</span>
                </div>
                {/* <div className='telephone-cont' >
                <span>Telephone : </span> <span className='bold-characters' >12345678</span>
              </div> */}
                <div className="contact-cont telephone-cont">
                  <span className="bold-characters">Telephone</span>
                  <div className="numbers-cont">
                    <div>
                      {" "}
                      <img src={us_flag} />{" "}
                      <span>
                        {" "}
                        <a
                          href={`tel:${project["contact"]["telephone"]["samir"]["us"]}`}
                        >
                          {project["contact"]["telephone"]["samir"]["us"]}
                        </a>{" "}
                      </span>{" "}
                      <span> (Samir Raiyani)</span>{" "}
                    </div>
                    <div>
                      <img src={germany_flag} />
                      <span>
                        <a
                          href={`tel:${project["contact"]["telephone"]["sumair"]["eu"]}`}
                        >
                          {project["contact"]["telephone"]["sumair"]["eu"]}
                        </a>{" "}
                      </span>{" "}
                      <span> (Sumair Riyaz) </span>{" "}
                    </div>
                  </div>
                </div>
                <div className="email-cont">
                  <p className="bold-characters">Email Support</p>
                  <a
                    href={`mailto:${project["contact"]["email"]}?Subject=Seeking%20Assistance%20with%20Dolcera%20IP%20Author`}
                    target="_blank"
                  >
                    {project["contact"]["email"]}
                  </a>
                </div>
                {project["contact"]["security_policy"] &&
                  project["contact"]["security_policy"].length > 0 && (
                    <div className="policy-cont">
                      <p className="bold-characters">
                        IP Author Security Policy
                      </p>
                      <a
                        href={`${project["contact"]["security_policy"]}`}
                        target="_blank"
                      >
                        Data Security and Privacy Policy
                      </a>
                    </div>
                  )}
              </div>
            </div>
          )}
                </div>
              </>
            )}
          </>

          <Nav className="ml-auto" navbar>
            {login && nameOnHeader && (
              <>
                <NavItem>
                  <a className="ah_profile_main">
                    <span
                      className={"ah_each_option profile"}
                      onClick={(event) => toggleProfileSelection(event)}
                    >
                      {/* <img
                        src={user_blue_icon}
                        className="user_blue_icon"
                        alt="Profile Main"
                      /> */}
                      <span className="user-name">{nameOnHeader}</span>
                    </span>
                  </a>

                  {isPorfileEnable && (
                    <div className="ah_eop_details">
                      <img src={triangle_down_blue_icon} alt="triangle down" />
                      <div className="aheopd_name">
                        <img src={user_fill_icon} alt="user icon" />
                        <span>
                          {localStorage.getItem("Username")
                            ? localStorage.getItem("Username")
                            : user_Name}
                        </span>
                      </div>

                      <div className="aheopd_action">
                        <div className="aheopd_action_logout">
                          <span onClick={() => authToggleHandler()}>
                            <img src={logout_icon} alt="logout" />
                            <span>Logout</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* <div className="Header-buttons">
                  <button
                    className="login-button"
                    onClick={() => authToggleHandler()}
                  >
                    Log out
                  </button>
                </div> */}
                </NavItem>
              </>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </Container>
  );
};
export default Header;
