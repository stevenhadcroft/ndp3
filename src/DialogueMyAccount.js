import { Fragment } from "react";
import { useDispatch, useSelector } from 'react-redux'
import CSSModules from 'react-css-modules';
import styles from './styles/';

// import { cancelMode, setUserName } from "./actions";

import { 
    cancelMode, 
} from "./features/viewSlice";

import DraggablePanel from "./DraggablePanel";
// import {deactivateLicence} from './services/dynamodb';

const DialogueMyAccount = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);


    // HANDLERS ---------------------------------------------------
    const onSubmit = () => {
    }

    const onUnlink = () => {
        // deactivateLicence(view.userName);
    }

    //--------------------------------------------------------------
	// Buttons
	//--------------------------------------------------------------
    const Buttons = (
        <Fragment>
            <button styleName="primary narrow blue" onClick={()=>dispatch(cancelMode())}>Done</button>
        </Fragment>
    )

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
	return (
        <DraggablePanel type="fullscreen" buttons={Buttons}>
            <div>
                <div styleName="dark-background">
                    <h3>Status</h3>
                    <div>Admin user</div>
                </div>
                
                <div styleName="dark-background">
                    <h3>Users</h3>
                    <p>This account has 3 associated sub accounts.</p> 
                    <button styleName="primary green" onClick={onSubmit}>Show primary users</button>
                    {/* <UserList/> */}
                    {/* <button className="menu-button first green" onClick={onSubmit}>Show secondary users</button>
                    <UserList/> */}
                    
                    {/* To add more accounts please contact NDP3 */}
                </div>

                <div styleName="dark-background">
                    <h3>Transfer licence</h3> 
                    <p>Click below to unregister the license from this device. Once unregistered you can re-register the same licence on a different device.</p> 
                    <button styleName="primary orange" onClick={onUnlink}>{view.userName ? "Unregister" : "Register"} Device</button>
                    <p>Speech Builder will not run without an active licence.</p>
                </div>

            </div>
        </DraggablePanel>


	);
}

export default CSSModules(DialogueMyAccount, styles, {allowMultiple:true});


function UserList({dispatch}) {
    return (
        <div className="table" style={{maxWidth:"700px"}}>
            <div style={{display:"flex", fontWeight:"500", color:"#AACCFF"}}>
                <span style={{flex:"1"}}>UserId</span>
                <span style={{flex:"1"}}>UserName</span>
                <span style={{flex:"1"}}>Activation Date</span>
            </div>
            <div style={{display:"flex", fontWeight:"normal"}}>
                <span style={{flex:"1"}}>123</span>
                <span style={{flex:"1"}}>Dave</span>
                <span style={{flex:"1"}}>12/08/2021</span>
            </div>
            <div style={{display:"flex", fontWeight:"normal"}}>
                <span style={{flex:"1"}}>123</span>
                <span style={{flex:"1"}}>Dave</span>
                <span style={{flex:"1"}}>12/08/2021</span>
            </div>
            <div style={{display:"flex", fontWeight:"normal"}}>
                <span style={{flex:"1"}}>123</span>
                <span style={{flex:"1"}}>Dave</span>
                <span style={{flex:"1"}}>12/08/2021</span>
            </div>
        </div>
	);
}