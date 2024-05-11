export const ADD_CONFIG = 'ADD_CONFIG'
export const ADD_API_CONFIG = 'ADD_API_CONFIG'
export const ADD_USER_ID = 'ADD_USER_ID'
export const ADD_PROJECT_ID = 'ADD_PROJECT_ID'
export const ADD_PROJECT_HISTORY_ID = "ADD_PROJECT_HISTORY_ID"
export const UPDATE_TOKEN = "UPDATE_TOKEN"

// Action creators

export const addConfig = (configData) => ({
  type: ADD_CONFIG,
  payload: configData,
});

export const addApiConfig = (configData) => ({
  type: ADD_API_CONFIG,
  payload: configData,
});


export const addUserId = (user_id) => ({
  type: ADD_USER_ID,
  payload: user_id,
});


export const addProjectId = (project_id) => ({
  type: ADD_PROJECT_ID,
  payload: project_id,
});

export const addProjectHistoryId = (project_history_id) => ({
  type: ADD_PROJECT_HISTORY_ID,
  payload: project_history_id,
});


export const logIn = (login) =>({
  type : "LOGIN",
  payload : login
})

export const logOut = (logOut) =>({
  type : "LOGOUT",
  payload : logOut
})

export const limitExceed = (data) =>({
  type : 'EXCEED'
})

export const inLimit = (data) =>({
  type : 'INLIMIT'
})

export const toggleModal =() => ({
  type : 'TOGGLEMODAL'
})
  
export const toggleRetryOverlay = () => ({
  type : 'TOGGLERETRYOVERLAY'
})

export const closeOverlay = () => ({
  type : "CLOSEOVERLAY"
})

export const loadingOnLogin = () =>
({
  type : "LOADING"
})

export const loginIsLoaded = () =>
({
  type : "NOTLOADING"
})

export const togglePatentEditModal =()=>
({
  type : "TOGGLEPATENTMODAL"
})

export const toggleClaimsEditModal =()=>
({
  type : "TOGGLECLAIMSMODAL"
})

export const contactDetails = (contact) =>
({
  type : "ADD_CONTACT_DETAILS",
  payload: contact,
})
export const addUserName =(data)=>
({
  type : "ADD_USER_NAME",
  payload:data
})
export const addMermaidConfig = (data) =>
({
  type : "ADD_MERMAID_CONFIG",
  payload: data,
})

export const enableDiaExport = (data) =>
({
  type: "ENABLEEXPORT",
  payload :data
})

export const disableDiaExport = (data) =>
({
  type: "DISABLEEXPORT",
  payload :data
})

export const updateToken = (token) => ({
  type: UPDATE_TOKEN,
  payload: token,
});

export const incrementDiaCount = (data) =>
({
  type: "INCREMENT",
  payload :data
})

export const resetDiaCount  = (data) =>
({
  type: "RESET",
  payload :data
})

export const addExpectedTimeOut = (data) => ({
  type: 'ADD_EXPECTED_TIMEOUT',
  payload: data,
});

export const addTimerMessages = (data) => ({
  type: 'ADD_TIMER_MESSAGES',
  payload: data,
});

export const patentExporting = (data) => ({
  type: 'PATENTEXPORTING',
  payload: data,
});

export const patentExported = (data) => ({
  type: 'PATENTEXPORTED',
  payload: data,
});

export const addCountries = (data) => ({
  type: 'ADD_COUNTRIES',
  payload: data,
});

export const templateSwitch = (data) => ({
  type: 'TEMPLATE_SWITCH',
  payload: data,
});

export const featureAccess = (data) => ({
  type: 'FEATURE_ACCESS',
  payload: data,
});

export const toasterTime = (data) => ({
  type: 'TOASTER_TIME',
  payload: data,
});
