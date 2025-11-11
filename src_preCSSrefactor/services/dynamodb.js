// import AWS from "aws-sdk"; 
// import {CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
// import {linkMachine, unlinkMachine} from './localLicenseMananger';
// import { setUserName } from '../actions'
// // import { useDispatch } from 'react-redux'

// // import { store } from '/path/to/createdStore';
// // const dispatch = useDispatch();

// const CLIENT_ID = "5o8763uop958pbomoc1q8rfhqf";
// const USER_POOL_ID = 'eu-west-1_KuNFB7UZQ';
// const IDENTITY_POOL_ID = 'eu-west-1:1cc07baf-8a41-4320-b5dc-80a364fd09cd';

// // const CLIENT_ID = "23iqc6spnshf1jpk2f54m1avt7";
// // const USER_POOL_ID = 'eu-west-1_klsBn13uw'; // NDP3b
// // const IDENTITY_POOL_ID = 'eu-west-1:1e250f0a-463e-4e72-8303-84dd2a1dee89';  // NDP3b

// // Initialize the Amazon Cognito credentials provider
// AWS.config.region = 'eu-west-1'; // Region
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: IDENTITY_POOL_ID,
// });
// var userPool = new CognitoUserPool({
// 	UserPoolId: USER_POOL_ID, 
// 	ClientId: CLIENT_ID, 
// });

// var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
              
// // var license = "aaaabbbb3";
// const email = 'test@test.com';
// // const storedUserName = "aaaabbbb";

// // TO CREATE ACCOUNT VIA ADMIN
// export const signUp  = (un) => {
//     let attributeList = ([
//         new CognitoUserAttribute({Name: 'email', Value: email,}),
//         new CognitoUserAttribute({Name: 'custom:status', Value: 'unlinked',})
//     ]);
//     const _username = un;
//     const _password = un;
//     userPool.signUp(_username, _password, attributeList, null, function(err, result) {
//         if (err) {
//             alert(err.message || JSON.stringify(err));
//             return;
//         }
//     });
// }

// export const signIn  = (un) => {
//     return new Promise((resolve, reject)=>{
//         const _username = un;
//         const _password = un;
//         var authenticationData = {Username : _username, Password : _password,};
//         var authenticationDetails = new AuthenticationDetails(authenticationData);
//         var userData = { Username : _username, Pool : userPool};
//         var cognitoUser = new CognitoUser(userData);
//         cognitoUser.authenticateUser(authenticationDetails, {
//             onSuccess: function (result) {
//                 let accessToken = result.getAccessToken().getJwtToken();
//                 // var idToken = result.idToken.jwtToken;
//                 // console.log('authenticateUser() accessToken ', accessToken);
//                 // console.log('authenticateUser() idToken ', idToken);  /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */    
//                 getUser(accessToken).then(user => {
//                     // console.log('getUser() user ', user);
//                     resolve({accessToken, user});
//                 })
//             },
//             onFailure: function(err) {
//                 alert(JSON.stringify(err));
//                 reject();
//             },
//         });
//     });
// }

// export const activateLicence = async (userName) => {
//     const result = await signIn(userName);
    
//     // check if licence available
//     const serverStatus = await getServerLinkStatus(result.user);
//     if (serverStatus.Value === 'linked'){
//         alert('This license has already been used');
//         return;
//     }

//     // activate licence
//     var params = {
//         AccessToken: result.accessToken,
//         UserAttributes: [{ Name:'custom:status', Value:'linked'}],
//     };
//     cognitoidentityserviceprovider.updateUserAttributes(params, async (err, data) => {
//         if (err) return;
//         linkMachine(userName);
//         window.store.dispatch(setUserName(userName)); 
//     });
// }

// export const deactivateLicence = async (userName) => {
//     const result = await signIn(userName);
//     var params = {
//         AccessToken: result.accessToken,
//         UserAttributes: [{ Name:'custom:status', Value:"unlinked"}],
//     };
//     cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
//         if (err) return;
//         unlinkMachine(userName);
//         window.store.dispatch(setUserName(null));
//     });
// }

// export const getUser = (accessToken)=>{
//     return new Promise((resolve, reject)=>{
//         var params = {AccessToken:accessToken};
//         cognitoidentityserviceprovider.getUser(params, function(err, data) {
//             err ? reject() : resolve(data);
//         });
//     })
// }

// export const listUsers = ()=>{
//     var params = {
//         UserPoolId: USER_POOL_ID,
//         AttributesToGet: ['custom:active'],
//       };
//       cognitoidentityserviceprovider.listUsers(params, function(err, data) {
//         if (err) return;
//         console.log(data);
//       });
// }

// export const getServerLinkStatus = (user) => {
//     return new Promise((resolve, reject)=>{
//         let status = user.UserAttributes.find(val => val.Name === 'custom:status');
//         if (!status) status = {};
//         resolve(status);
//     });
// }
