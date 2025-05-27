import { useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from '../styles';
import { eMode } from "../constants";
import Swal from 'sweetalert2';

// import { 
//     setUserName,
// } from '../actions'

import { 
    setTemplateData,
    setImageData, 
    setTextData, 
} from "../features/canvasSlice";

import { 
    setMode, 
} from "../features/viewSlice";

import DraggablePanel from "./DraggablePanel";
import { getUser, createUser } from "../services/userMananger";
import {linkMachine, unlinkMachine} from '../services/localLicenseMananger';
import {validateKey} from '../utils';


const DialogueUser = () => {

    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    // const inputRef = useRef();
    const inputRefSignInEmail = useRef();
    const inputRefSignInPassword = useRef();
    // const inputRefRegisterKey = useRef();
    const inputRefRegisterName = useRef();
    const inputRefRegisterEmail = useRef();
    const inputRefRegisterPassword = useRef();
    const inputRefRegisterPassword2 = useRef();

    const flex = {flex:"1", margin:"10px 20px"};
    const center = {whiteSpace:"nowrap", width:"100%", textAlign:"center"}


    // HANDLERS ---------------------------------------------------
    const onSignIn = async () => {

        // const data = { email: "steven@stevenhadcroft.com", password: "pass1234" }
        const email = inputRefSignInEmail.current.value;
        const password = "temp disabled"; // inputRefSignInPassword.current.value;
        
        if (!email || !password){
            Swal.fire({
                title: 'Error!',
                text: 'Please complete all details',
                icon: 'error',
                confirmButtonText: 'Continue'
            })
        }
        const data = { email, password };
        let response = await getUser(data)

        // alert(JSON.stringify(response));

        if (response.complete === 1 && response.approval === "approved") {

            //clear out old data
            dispatch(setImageData([]));
            dispatch(setTextData([]));
            dispatch(setTemplateData([]));
            // dispatch(setUserName(email)); 

            dispatch(setMode(eMode.USER_ACTIVE))
            linkMachine();
            
        } else if (response.complete === 1 && response.approval !== "approved") {
            dispatch(setMode(eMode.USER_OPTIONS))
            Swal.fire({
                title: 'Account pending',
                text: 'Your account is pending approval',
                icon: 'warning',
                footer: 'For more info contact&nbsp;<a href="info@ndp3.org">info@ndp3.org</a>',
                confirmButtonText: 'Close'
            })

        } else {
            Swal.fire({
                title: 'Error!',
                text: 'User not found or login detail incorrect',
                icon: 'error',
                confirmButtonText: 'Continue'
            })
            unlinkMachine();
            return false;
        }
    }

    const onRegister = (col) => {

        // const key = inputRefRegisterKey.current.value;
        const key = inputRefRegisterPassword.current.value;
        const name = inputRefRegisterName.current.value;
        const email = inputRefRegisterEmail.current.value;
        const password = inputRefRegisterPassword.current.value;
        const passwordConfirm = inputRefRegisterPassword2.current.value;

        //-----check key
        // 0 && 0 && 
        // validateKey(key);
        // return;

        if (!validateKey(key)){
            Swal.fire({
                title: 'Error!',
                text: 'Key not valid',
                icon: 'error',
                confirmButtonText: 'Continue'
              })
            return;
        }

        if (password !== passwordConfirm){
            Swal.fire({
                title: 'Error!',
                text: 'Passwords must be the same',
                icon: 'error',
                confirmButtonText: 'Continue'
              })
            return;
        }

        if (!key || !name || !email || !password){
            Swal.fire({
                title: 'Error!',
                text: 'Please complete all details',
                icon: 'error',
                confirmButtonText: 'Continue'
              })
              return false;
        }

        const data = { key, name, email, password};

        // console.log(data);
        createUser(data)
            .then((response) => {
                console.log('response ', response);
                if (response.complete === 1){
                    // setShow(eMode.USER_SIGN_IN);
                    Swal.fire({
                        title: 'Success!',
                        text: 'Your account has been created.',
                        icon: 'success',
                        footer: 'Please sign in to continue.',
                        confirmButtonText: 'Sign In'
                    })
                    dispatch(setMode(eMode.USER_SIGN_IN))
                } else {
                    // alert("user not found")
                    Swal.fire({
                        title: 'Error!',
                        text: response.message, /// /'Uesr alInvalid details or ',
                        icon: 'error',
                        confirmButtonText: 'Continue'
                      })
                }
            })
    }

    // const onClose = () => {
    //     dispatch(setBrushColour(null));
    //     if (view.mode === eMode.COLOUR_TEXT) {
    //         // go back to edit text mode - where we came from
    //         dispatch(setMode(eMode.EDIT_TEXT));
    //     } else {
    //         dispatch(cancelMode());
    //     }
    // }

    //--------------------------------------------------------------
    // Buttons Component
    //--------------------------------------------------------------

    const Buttons = (
        <>
            <button styleName="primary narrow blue" onClick={() => { }}>Done</button>
        </>
    )

    const Container = ({ children }) =>
        <div style={{ position: "absolute", top: "50px", left: "0", width: "100%", height: "100%", background: "#48759e" }}>
            {children}
        </div>


    //--------------------------------------------------------------
    // Sign in 
    //--------------------------------------------------------------
    const Options = () =>
        <DraggablePanel central={true} id='sign-in' title="Options">   {/* buttons={Buttons} */}
            <div style={{ textAlign: 'center'}}>
                <div style={{ height: "20px" }} />
                <button styleName="primary narrow green" onClick={() => { dispatch(setMode(eMode.USER_SIGN_IN)) }}>Sign In</button>
                <div style={{ height: "20px" }} />
                <button styleName="primary narrow green" onClick={() => { dispatch(setMode(eMode.USER_REGISTER)) }}>Register</button>
                <div style={{ height: "50px" }} />
                <button styleName="secondary narrow" onClick={()=>dispatch(setMode(eMode.USER_OPTIONS))}>Forgotten License Key</button>
            </div>
        </DraggablePanel>

    //--------------------------------------------------------------
    // Sign in 
    //--------------------------------------------------------------
    const SignIn = () =>
        <DraggablePanel central={true} id='sign-in' title="Sign In">   {/* buttons={Buttons} */}
            <div style={{ padding: '0 50px' }}>

                <div style={{ fontWeight: "normal" }}>Email</div>
                <br /><input style={{ width: "100%" }} name="email" type="text" className="rounded" ref={inputRefSignInEmail} />

                <div style={{ height: "20px" }} />

                <div style={{ fontWeight: "normal" }}>Licence Key</div>
                <br /><input style={{ width: "100%" }} name="password" type="text" className="rounded" ref={inputRefSignInPassword} />

                <div style={{ height: "50px" }} />

                <div style={center}>
                    <button styleName="primary narrow red" onClick={()=>dispatch(setMode(eMode.USER_OPTIONS))}>Cancel</button>
                    <button styleName="primary narrow green" onClick={onSignIn}>Submit</button>
                </div>

                <div style={center}>
                    <button styleName="secondary narrow red" onClick={()=>dispatch(setMode(eMode.USER_OPTIONS))}>Forgotten License Key</button>
                </div>
                

            </div>
        </DraggablePanel>

    //--------------------------------------------------------------
    // Register
    //--------------------------------------------------------------
    
    const Register = () =>
        <DraggablePanel central={true} id='sign-up' title="Sign Up">
            {/*  */}
            <div style={{ padding: '0 20px' }}>

                {/* <div style={{ display: "flex" }}>
                    <div style={flex}>
                        <div style={{ fontWeight: "bold" }}>Licence Key</div>
                        <br /><input type="text" className="rounded" ref={inputRefRegisterKey} />
                    </div>
                </div> */}

                {/* <div style={{ height: "20px" }} /> */}

                <div style={{ display: "flex" }}>
                    <div style={flex}>
                        <div style={{ fontWeight: "normal" }}>Name</div>
                        <br /><input type="text" className="rounded" ref={inputRefRegisterName} />
                    </div>
                    <div style={flex}>
                        <div style={{ fontWeight: "normal" }}>Email</div>
                        <br /><input type="text" className="rounded" ref={inputRefRegisterEmail} />
                    </div>
                </div>

                <div style={{ height: "20px" }} />

                <div style={{ display: "flex" }}>
                    <div style={flex}>
                        <div style={{ fontWeight: "normal" }}>Licence Key</div>
                        <br /><input type="text" className="rounded" ref={inputRefRegisterPassword} />
                    </div>
                    {/* <div style={{ height: "30px" }} /> */}
                    <div style={flex}>
                        <div style={{ fontWeight: "normal" }}>Re Enter Licence Key</div>
                        <br /><input type="text" className="rounded" ref={inputRefRegisterPassword2} />
                    </div>
                </div>

                <div style={{ height: "50px" }} />

                <div style={center}>
                    <button styleName="primary narrow red" onClick={()=>dispatch(setMode(eMode.USER_OPTIONS))}>Cancel</button>
                    <button styleName="primary narrow green" onClick={onRegister}>Submit</button>
                </div>
                
            </div>
        </DraggablePanel>


    return (
        <>
            {view.mode === eMode.USER_PENDING &&
                <Container>
                </Container>
            }
            {view.mode === eMode.USER_OPTIONS &&
                <Container>
                    <Options />
                </Container>
            }
            {view.mode === eMode.USER_REGISTER &&
                <Container>
                    <Register />
                </Container>
            }
            {view.mode === eMode.USER_SIGN_IN &&
                <Container>
                    <SignIn />
                </Container>
            }
        </>
    );
}

export default CSSModules(DialogueUser, styles, { allowMultiple: true });