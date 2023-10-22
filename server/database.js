import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost/project-root/public/api/chat",
});

// --------------------session-------------------------//


const getSession = async (sessionID) => {
  let resultSession = null;
  let errorSession = null;
  try {
    const response = await instance({
      method: "GET",
      mode: "cors",
      timeout: 1000,
      url: "/getsession",
      responseType: 'json',
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      params: {
        session_id: sessionID,
      },
    });
    resultSession = await response.data;
  } catch (e) {
    errorSession = e;
  }
  return { resultSession, errorSession };
};





// --------------------Message-------------------------//



// ---------------------------------------------//
// Add Room


export {
  //getSessions,
  getSession,
  //getUserMessages,
 // saveUserMessage,
};
