import axios from "axios";
import untruncateJson from "untruncate-json";

var apiCallCount = {};

var errorHandling = function (data) {
  let status = data.status;
  return {
    status: "Error",
    message: "We're sorry, but we couldn't process your request at this time. Please try again shortly.",
    message_long: "Failed to process your request.",
    message_time: 5000,
    statusCode: status,
  };
};


var streamApi = {
  getData: async function (
    type,
    api,
    data,
    signal = new AbortController().signal,
    callBack,
    isContent = false,
    call = true
  ) {
    const apiDataKey = `${JSON.stringify(api)}-${JSON.stringify(data)}`;

    let autoRetry = { autoRetry: false };

    // Increment or initialize the call count for the API/data combination
    apiCallCount[apiDataKey] = (apiCallCount[apiDataKey] || 0) + 1;

    if (apiCallCount[apiDataKey] >2) {
      // Reset the count and trigger the callback for retry
      delete apiCallCount[apiDataKey];
      callBack({
        isFinish: true,
        content: "",
        retry: true,
        shortMessage: "We're sorry, but we couldn't process your request at this time. Please try again shortly.",
        longMessage: "Failed to process your request.",
      });
      call = false;
      return; // Stop execution if retry limit exceeded
    }

    autoRetry["autoRetry"] = apiCallCount[apiDataKey] > 1;
    Object.assign(data, autoRetry);

    const jwttoken = await localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${jwttoken}`,
      "Content-Type": "application/json", // Set the appropriate content type for your requests.
    };
    var tmpPromptResponse = "";
    try {
      if (call) {

        let streamContent = { isFinish: false, content: "" };
        const response = await fetch(api, {
          method: type ? type : "get",
          headers: headers,
          body: JSON.stringify(data),
          signal,
        });

        // eslint-disable-next-line no-undef
        var decoder = new TextDecoderStream();
        if (!response.body) return;
        const reader = response.body.pipeThrough(decoder).getReader();

        // console.log("StreamAPI", api);
        const parts = api.split("/");
        const lastPart = parts[parts.length - 1];
        // console.log("lastPart =>", lastPart);

        while (true) {
          var { value, done } = await reader.read();
          streamContent.retry = false;
          // console.log("Stream A =>", api, "<==>", value);
          if (done) {
            // console.log("Stream Done =>", api, "<==>", done);
            streamContent.isFinish = true;
            callBack(streamContent);
            break;
          } else {
            streamContent.isFinish = false;
            let pattern = "@#@$@#@";

            let isPatternPresent = value.indexOf(pattern) !== -1;

            if (value == "@#@$@#@" || isPatternPresent) {
              if (
                lastPart !== "flowchart_description" &&
                lastPart !== "block_diagram_description" &&
                lastPart !== "extra_description" &&
                lastPart !== "claim_invention" &&
                lastPart !== "total_detailed_description" 
              ) {
                tmpPromptResponse = "";
              }
              isContent = true;
            }

            if(lastPart === 'block_diagram'){
              // Input string
              let inputString = value;
              // Regular expression to match "==text=="
              let regex = /==([^=]+)==/g;
              // Replace "==text==" with "text"
              value = inputString.replace(regex, "$1");
            }
            // value = value.replace('```mermaid','{"mermaid" : "');

            tmpPromptResponse += value;
            tmpPromptResponse = tmpPromptResponse.replace(/ *@#@$@#@ */g, "");
            if (
              (lastPart == "flowchart_description" ||
                lastPart == "block_diagram_description" 
                || lastPart === "extra_description" || lastPart === "claim_invention" || lastPart === "total_detailed_description") &&
              tmpPromptResponse.length > 7
            ) {
              tmpPromptResponse = tmpPromptResponse.replace("@#@$@#@", "\n\n");
            } else {
              tmpPromptResponse = tmpPromptResponse.replace("@#@$@#@", "");
            }
            let details;
            try {
              details = JSON.parse(untruncateJson(tmpPromptResponse));
              // console.log("tmpPromptResponse==>",lastPart,"Pass==>",tmpPromptResponse)
              // console.log("details==>",lastPart,"Pass==>",details)
            } catch (e) {
              // console.log("tmpPromptResponse==>",lastPart,"Fail==>",tmpPromptResponse)
              details = {};
            }

            // console.log("tmpPromptResponse", tmpPromptResponse);

            if (isContent && details && Object.keys(details).length > 0) {
              streamContent.content = details;
              callBack(streamContent);
            } else if (
              (lastPart == "flowchart_description" &&
                tmpPromptResponse !== "@#@$@#@") ||
              (lastPart == "block_diagram_description" &&
                tmpPromptResponse !== "@#@$@#@") ||
              (lastPart == "extra_description" &&
                tmpPromptResponse !== "@#@$@#@") ||
              (lastPart == "claim_invention" &&
                tmpPromptResponse !== "@#@$@#@") ||
              (lastPart == "total_detailed_description" &&
                tmpPromptResponse !== "@#@$@#@")
            ) {
              // console.log("Inside", lastPart);
              streamContent.content = tmpPromptResponse;
              callBack(streamContent);
            }
          }
        }

        if (response.status === 401) {
          // Handle token error
          window.location.reload(true);
        }

        return tmpPromptResponse;
      } else {
        // apiCallCount[apiDataKey] = 0;
        delete apiCallCount.apiDataKey;
        call = true;
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.status === "token_error"
      ) {
        // Handle token error
        window.location.reload(true);
      } else if (error.response) {
        // Handle other response errors
        return errorHandling(error.response.data);
      } else {
        // Handle other Axios errors
        console.log(error);
        callBack({
          isFinish: true,
          content: "",
          retry: true,
          shortMessage: "Failed to generate please retry",
          longMessage: "Failed to generate data please retry",
        });
        delete apiCallCount[apiDataKey];
      }
    }
  },
};

export default streamApi;
