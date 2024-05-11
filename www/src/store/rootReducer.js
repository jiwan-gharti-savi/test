import { combineReducers } from "redux";
import projectReducer from "./projectRecucer.js";
import authReducer from "./authReducer.js";
import inputLimitReducer from "./inputLimitReducer.js";
import modalReducer from "./modalReducer.js";
import loadingOnLoginRed from "./loadingOnLoginRed.js";
import patentEditModalRed from "./patentEditModalReducer.js";
import genrateClaimsModalRed from "./generateClaimsModalRed.js";
import flowChartRed from "./flowChartRed.js";
import countDiagramsRed from "./countDiagrams.js"
import exportReducer from "./exportReducer.js";
import roleReducer from "./slices/roleCheck.js";


const rootReducer = combineReducers({
  projectData : projectReducer,
  authReducer : authReducer,
  inputLimitReducer,
  modalReducer,
  loadingOnLoginRed,
  patentEditModalRed,
  genrateClaimsModalRed,
  flowChartRed,
  countDiagramsRed,
  exportReducer,
  roleReducer
});

export default rootReducer;