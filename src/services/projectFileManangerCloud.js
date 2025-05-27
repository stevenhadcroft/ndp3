import { useDispatch } from 'react-redux'
import { Constants, eMode } from "../constants";
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

// const onSignOut = () => { // DUPED FUNCTION FROM MENU LEFT
//   // const dispatch = useDispatch();
//   dispatch(showLoader(false));
//   dispatch(setMenuOpen(false));
//   unlinkMachine();
//   dispatch(setMode(eMode.USER_OPTIONS));
// };

// function useCancel() {
  // const dispatch = useDispatch();
  // dispatch(showLoader(false));
  // dispatch(setMenuOpen(false));
  // dispatch(setMode(null));
// }

// const onCancel = () => {
//   const dispatch = useDispatch();
//   dispatch(showLoader(false));
//   dispatch(setMenuOpen(false));
//   dispatch(setMode(null));
// };

const responseOk = (response) => {
  // let response = JSON.parse(r);
  
  // console.log('resp ', resp);
  // console.log('response ', response);
  // console.log('response.data ', response.data);
  // console.log('response.data ', typeof response.data);
  // console.log('XX response.data ', JSON.parse(response.data));
  console.log('response.data.error ', response.data.error);
  console.log('response.data.complete ', response.data.complete);
  // console.log('response.data.complete ', response.data.complete);

  // let resp = JSON.parse(response.data);
  // console.log('resp ', resp);

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
    // const dispatch = useDispatch();
    return false;
  }
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

export const storeProject = (name, projectid, description, thumbnail, rawdata, dirname, orientation) => {
    console.log('projectid ', projectid);
    const data = { 
                  ...credentials, 
                  mode : "storeProject", 
                  name, 
                  projectid,
                  description, 
                  thumbnail, 
                  data:encodeURIComponent(JSON.stringify(rawdata)), 
                  dirname,
                  orientation
              };

    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            if (responseOk(response)){
              resolve(response.data);
            }
          });
    })
}

export const getProject = async (file) => {
  const data = { ...credentials, mode: "getProject", projectid: file.id };
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: Constants.API_URL + 'functions.php',
      data
    })
      .then(function (response) {
        try {
          if (responseOk(response)) {
            // resolve(response.data);
            resolve(decodeURIComponent(response.data.data.data));
          }
        } catch (e) {
          // console.error("GET PROJECT ERROR ", e);
          Swal.fire({
            title: 'Oops, theres a problem',
            text: 'Sorry, the project list can not be loaded',
            icon: 'error',
            confirmButtonText: 'Continue'
          });
        }
      })
      .catch(() => {
        Swal.fire({
          title: 'Oops, theres a problem',
          text: 'Sorry, the project can not be loaded',
          icon: 'error',
          confirmButtonText: 'Continue'
        });
      });
  })
}

export const deleteProject = async (file) => {
    const data = { ...credentials, mode: "deleteProject", projectid:file.id };
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            if (responseOk(response)){
              resolve(response.data);
            }
          });
    })
}

//------------------------------------------------
// DIRECTORY FUNCTIONS
//------------------------------------------------

export const createDir = (dirname) => {
    const data = {...credentials, mode: "createDir", dirname};
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            if (responseOk(response)){
              resolve(response.data);
            }
          });
    })
}

export const getDirs = () => {
  const data = {...credentials, mode: "getDirs"};
  return new Promise((resolve, reject)=>{
      axios({
          method: 'post',
          url: Constants.API_URL + 'functions.php',
          data
        })
        .then(function (response) {
          if (responseOk(response)){
            resolve(response.data);
          }
        });
  })
}

export const deleteDir = async (file) => {
    const data = { ...credentials, mode: "deleteDir", dirid:file.id };
    return new Promise((resolve, reject)=>{
        axios({
            method: 'post',
            url: Constants.API_URL + 'functions.php',
            data
          })
          .then(function (response) {
            if (responseOk(response)){
              resolve(response.data);
            }
          });
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
    
    // return new Promise( async (resolve, reject) => {
    //     let projects = await db.projects.where("id").above(0).toArray();

    //     if (dirname){
    //         projects = projects.filter(proj => proj.dirname === dirname); 
    //     } else {
    //         projects = projects.filter(proj => !proj.dirname); 
    //     }
        
    //     console.log('>>> projects ', projects);
    //     const directories = await db.directories.where("id").above(0).toArray();
    //     resolve({projects,directories});
	// });
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


