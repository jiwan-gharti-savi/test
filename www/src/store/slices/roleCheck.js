import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiServices from "../../services/apiServices";
import { featureAccess } from "../action";

const roleCheckToBackendHandler = async (roleCheckToBackend, metaData) => {
  try {
    let data = [
      "prior_art_explore",
      "prior_art_masked",
      "drafting_draft_claim",
      "prior_art_view",
      "drafting_view_specs",
      "drafting_edit_specs",
      "drafting_view_claim",
      "drafting_prompt_specs",

      "drafting_edit_title",
      "drafting_edit_abstract",
      "drafting_edit_technical_field",
      "drafting_edit_background",
      "drafting_edit_summary",
      "drafting_edit_claim",

      "drafting_prompt_title",
      "drafting_prompt_abstract",
      "drafting_prompt_technical_field",
      "drafting_prompt_background",
      "drafting_prompt_summary",
      "drafting_prompt_claim",
    ];

    data = metaData;

    const roles = await apiServices.getData("post", roleCheckToBackend, data);
    return roles;
  } catch (e) {
    return "unauthorized";
  }
};

export const fetchUserRoles = createAsyncThunk(
  "role/fetchUserRolesStatus",
  async (
    {
      userRoleEmail,
      userRoleEndPoint,
      verifySessionEndpoint,
      roleCheckToBackend,
    },
    thunkAPI
  ) => {
    let response = "unauthorized";
    try {
      let data = {
        email: userRoleEmail,
      };
      const verifyEmail = await apiServices.getData(
        "post",
        userRoleEndPoint,
        data
      );

      if (verifyEmail?.user_status === "active") {
        const jwt = await apiServices.getData("post", verifySessionEndpoint);
        if (jwt && jwt.status === "Success") {
          let roleCheck = await roleCheckToBackendHandler(roleCheckToBackend, verifyEmail);
          if ( roleCheck  && roleCheck?.status != "Error" && roleCheck !== "unauthorized") {
            response = verifyEmail;
            let flags = roleCheck?.flags ? roleCheck?.flags : []
            thunkAPI.dispatch(featureAccess(flags));
          }else{
            response = verifyEmail;
          }
        }
      }

      return response;
    } catch (e) {
      return response;
    }
  }
);

const initialState = { roleLoading: true };

const roleSlice = createSlice({
  name: "role",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchUserRoles.pending, (state, action) => {
      state.roleLoading = true;
    });
    builder.addCase(fetchUserRoles.fulfilled, (state, action) => {
      state.roleLoading = false;
    });
    builder.addCase(fetchUserRoles.rejected, (state, action) => {
      state.roleLoading = false;
    });
  },
});

const { reducer } = roleSlice;
export default reducer;
