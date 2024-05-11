import React, { useState , useEffect} from "react";
import { Container, Row, Col } from "reactstrap";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import "./History.scss";
import HistoryTab from "./HistoryTab";
import HistoryPrompt from "./HistoryPrompt";
import { isAccess } from "../../../../utils/accessCheck";

const History = (props) => {

  const [activeTab, setActiveTab] = useState("history-tab");
  const [isPageScrollTop, setPageScrollTop] = useState(false);


  const updateActiveTab = (tab) => {
    setActiveTab(tab);
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    console.log(scrollTop)
    if(scrollTop >=166){
      setPageScrollTop(true)
    }else{
      setPageScrollTop(false)
    }
  }

  useEffect(()=>{
    window.addEventListener("scroll", handleScroll);
    return()=>{
      window.removeEventListener("scroll", handleScroll);
    }
  },[])

  const sectionAccessMapping = {
    'Title': 'drafting_prompt_title',
    'Abstract': 'drafting_prompt_abstract',
    'technical_Field': 'drafting_prompt_technical_field',
    'background_Description': 'drafting_prompt_background',
    'summary': 'drafting_prompt_summary',
    'Claims': 'drafting_prompt_claim',
  };

  let sectionAccessType = sectionAccessMapping[props.editText] || "";
  let isUserAccessToPrompt =(isAccess(props,sectionAccessType) ||  isAccess(props.project,'drafting_prompt_specs'));

  return (
    <Col
      // lg={3}
      // md={12}
      // sm={12}
      // xs={12}
      id="GeneratedText"
      className="section-history-container"
    >
      <div className = {`${isPageScrollTop ? "history-right-tab-scroll" : ""}`} >
      <Tab.Container activeKey={activeTab} >
        <Nav variant="tabs" defaultActiveKey="prompt-tab">
          <Nav.Item>
            <Nav.Link eventKey="history-tab" onClick={() => updateActiveTab("history-tab")} > History</Nav.Link>
          </Nav.Item>
         { isUserAccessToPrompt && <Nav.Item>
            <Nav.Link eventKey="prompt-tab" onClick={() => updateActiveTab("prompt-tab")} >Prompt</Nav.Link>
          </Nav.Item>}
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="prompt-tab">
            <HistoryPrompt {...props} 
            updateActiveTabHandler = {updateActiveTab}
             />
          </Tab.Pane>
          <Tab.Pane eventKey="history-tab">
           <HistoryTab {...props} 
           updateActiveTabHandler = {updateActiveTab}
           />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      </div>
    
    </Col>
  );
};
export default History;