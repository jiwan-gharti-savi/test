const initialState = {
  project: [],
  nextId: 1,
  userName: "",
};

const projectReducer = (state = initialState, action) => {
  if (action.type === "ADD_USER_ID") {
    return {
      ...state,
      user_id: action.payload,
    };
  } else if (action.type === "ADD_PROJECT_ID") {
    return {
      ...state,
      project_id: action.payload,
    };
  } else if (action.type === "ADD_PROJECT_HISTORY_ID") {
    return {
      ...state,
      project_history_id: action.payload,
    };
  } else if (action.type === "ADD_CONFIG") {
    return {
      ...state,
      config: action.payload,
    };
  } else if (action.type === "ADD_API_CONFIG") {
    return {
      ...state,
      api_config: action.payload,
    };
  } else if (action.type === "ADD_USER_NAME") {
    return {
      ...state,
      userName: action.payload,
    };
  } else if (action.type === "ADD_CONTACT_DETAILS") {
    return {
      ...state,
      contact: action.payload,
    };
  } else if (action.type === "ADD_MERMAID_CONFIG") {
    return {
      ...state,
      mermaid_config: action.payload,
    };
  } else if (action.type === "ADD_EXPECTED_TIMEOUT") {
    return {
      ...state,
      expectedTimeout: action.payload,
    };
  } else if (action.type === "ADD_TIMER_MESSAGES") {
    return {
      ...state,
      timerMessages: action.payload,
    };
  } else if (action.type === "ADD_COUNTRIES") {
    return {
      ...state,
      countries: action.payload,
    };
  } else if (action.type === "TEMPLATE_SWITCH") {
    return {
      ...state,
      template: action.payload,
    };
  } else if (action.type === "FEATURE_ACCESS") {
    console.log("ACTION==>",action);
    return {
      ...state,
      featureAccess: action.payload,
    };
  } else if (action.type === "TOASTER_TIME") {
    return {
      ...state,
      toaster: action.payload,
    };
  } else {
    return state;
  }
};

export default projectReducer;
