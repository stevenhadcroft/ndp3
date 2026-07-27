import { Constants } from "../constants";
import axios from "axios";

// Builds a user-readable message from an axios error, covering the three
// failure shapes axios can produce: server responded with an error status,
// request was sent but no response came back, or the request never went out.
const describeAxiosError = (error) => {
    if (error.response) {
        const serverMessage = error.response.data && error.response.data.message;
        return serverMessage || `Server error (${error.response.status})`;
    }
    if (error.request) {
        return "No response from server. Please check your internet connection and try again.";
    }
    return error.message || "An unexpected error occurred.";
};

const reportError = (operation, error) => {
    const details = describeAxiosError(error);
    console.error(`userMananger.${operation}() failed:`, error);
    return details;
};

export const getUser = (payload) => {
    const data = { mode: "getUser", ...payload };
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            try {
                console.log(response.data);
                const credentials = {userid:response.data.id, token:response.data.token}
                // console.log("getUser() credentials ", credentials);
                localStorage.setItem("NDP3Credentials", JSON.stringify(credentials));
                if (window.REFRESH_CREDS) window.REFRESH_CREDS();
                resolve(response.data);
            } catch (error) {
                const details = reportError('getUser', error);
                reject(new Error(details));
            }
          })
          .catch(function (error) {
            const details = reportError('getUser', error);
            reject(new Error(details));
          });
    })
}

export const createUser = (payload) => {
    const data = { mode: "createUser", ...payload };
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            console.log(response.data);
            resolve(response.data);
          })
          .catch(function (error) {
            const details = reportError('createUser', error);
            reject(new Error(details));
          });
    })
}



