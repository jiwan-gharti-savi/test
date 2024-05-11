import axios from "axios";

var errorHandling = function (failedData,error) {
  let status = failedData.status;
  let errorMessage = {
    status: "Error",
    message: "Failed to create. Please try again. Thank you.",
    message_long: "Failed to create.",
    message_time: 5000,
    statusCode: status,
  };
  if(error?.name && error?.name === "CanceledError"){
    errorMessage["name"] = "CanceledError"
  }
  return errorMessage;
};

var apiServices = {
  getData: async function (
    type,
    api,
    data,
    token = null,
    responseType,
    documents,
    attempt = 0
  ) {
    const jwttoken = await localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${jwttoken}`,
      // 'Content-Type': 'application/json',
    };
    if (!documents) {
      headers["Content-Type"] = "application/json";
    }

    const endPoint = api.split("/").pop();
    try {
      const response = await axios({
        cancelToken: token,
        method: type || "get",
        url: api,
        data: data,
        headers: headers,
        responseType: responseType,
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
      let errorData = error?.response || {};
      if (errorData?.data?.status === "token_error") {
        window.location.reload(true);
      } else if (attempt < 1 && endPoint !== "similarity") {
        return this.getData(type, api, data, token, responseType, documents, attempt + 1);
      } else {
        return errorHandling(errorData,error);
      }
    }
  },
};

export default apiServices;
