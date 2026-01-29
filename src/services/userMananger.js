import { Constants } from "../constants";
import axios from "axios";

export const getUser = (payload) => {
    const data = { mode: "getUser", ...payload };
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            console.log(response.data);
            const credentials = {userid:response.data.id, token:response.data.token}
            // console.log("getUser() credentials ", credentials);
            localStorage.setItem("NDP3Credentials", JSON.stringify(credentials));
            if (window.REFRESH_CREDS) window.REFRESH_CREDS();
            resolve(response.data);
          });
    })
}

export const createUser = (payload) => {
    const data = { mode: "createUser", ...payload };
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            console.log(response.data);
            resolve(response.data);
          });
    })
}



