import { Constants } from "../constants";
import axios from "axios";
import Swal from 'sweetalert2'

// import {unlinkMachine} from '../services/localLicenseMananger';

window.LOCAL = 0;

let credentials = {userid:null, token:null};
window.REFRESH_CREDS = () => {
  credentials = JSON.parse(localStorage.getItem("NDP3Credentials"));
  console.log('credentials from localStorage ', credentials);  
}
window.REFRESH_CREDS();


const responseOk = (response) => {
  if (response.data.complete === 1) {
    return true;

  } else if (response.data.error === 1) {
    Swal.fire({
      title: 'Error - Log in expired',
      text: 'You will need to log in again',
      icon: 'error',
      confirmButtonText: 'Continue'
    })
    window.UNSAFELY_CALL_onSignOut()
    return false;
  }
}

const genericCall = (params) => {
  const { data, resolve, reject, decode = false } = params;
    axios({
        method: 'post',
        url: Constants.API_URL + 'functions.php',
        data
      })
      .then(function (response) {
        if (responseOk(response)){
          if (decode) {
            resolve(decodeURIComponent(response.data.data.data));
          } else {
            resolve(response.data);
          }
        }
      })
      .catch(() => {
        Swal.fire({
          title: 'Oops, theres a problem',
          // text: 'Sorry, the project can not be loaded',
          icon: 'error',
          confirmButtonText: 'Continue'
        });
      });
}


//------------------------------------------------
// USER FUNCTIONS
//------------------------------------------------

// ****** IN userManager *******

// export const getUser = (payload) => {
//     const data = { usermode: "getUser", ...payload };
//     return new Promise((resolve, reject)=>{
//         axios({
//             method: 'post',
//             url: Constants.API_URL + 'functions.php',
//             data
//           })
//           .then(function (response) {
//             console.log(response.data);
//             credentials = {userid:response.data.userid, token:response.data.token}
//             resolve(response.data);
//           });
//     })
// }

//------------------------------------------------
// PROJECT FUNCTIONS
//------------------------------------------------

export const storeProject = (params) => {
  let data = { ...credentials, mode: "storeProject", ...params };
  data.data = encodeURIComponent(JSON.stringify(params.data));
  return new Promise((resolve, reject) => {
    genericCall({ data, resolve, reject });
  })
}

export const getProject = async (file) => {
  const data = { ...credentials, mode: "getProject", projectid: file.id };
  return new Promise((resolve, reject) => {
    genericCall({data, resolve, reject, decode:true});
  })
}

export const deleteProject = async (file) => {
    const data = { ...credentials, mode: "deleteProject", projectid:file.id };
    return new Promise((resolve, reject)=>{
      genericCall({data, resolve, reject});
    })
}

//------------------------------------------------
// DIRECTORY FUNCTIONS
//------------------------------------------------

export const createDir = (dirname) => {
    const data = {...credentials, mode: "createDir", dirname};
    return new Promise((resolve, reject)=>{
      genericCall({data, resolve, reject});
    })
}

export const getDirs = () => {
  const data = {...credentials, mode: "getDirs"};
  return new Promise((resolve, reject)=>{
    genericCall({data, resolve, reject});
  })
}

export const deleteDir = async (file) => {
    const data = { ...credentials, mode: "deleteDir", dirid:file.id };
    return new Promise((resolve, reject)=>{
      genericCall({data, resolve, reject});
    })
}


export const getProjectList = (dirname) => {
    const data = {...credentials, mode: "getProjectList"};
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            console.log('getProjectList OK')
            if (responseOk(response)){
              console.log('getProjectList OK VALID')
              const projects = response.data.projects;
              const directories = [];
              resolve({projects,directories});
            } else {
              console.log('getProjectList NOT VALID ')
              reject(null);
            }
          })
          .catch(() => {
            console.log('getProjectList FAIL')
            reject(null);
          });
    })
}




// export const storeImageColouring = (imageId, data) => {
//     const file = {name:imageId, data};
//     console.log('storeImageColouring() file ', file);
//     return new Promise((resolve, reject) => {
//         db.transaction('rw', db.projects, async() => {
//             const existingFile = await db.projects.where({name:imageId}).first();
//             if (existingFile){
//                 await db.projects.update(existingFile.id, file);
//             } else {
//                 await db.projects.add(file);
//             }
//         });
// 	});
// }


