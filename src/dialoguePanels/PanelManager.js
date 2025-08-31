import { useSelector } from 'react-redux';
import { eMode } from "../constants";
import DialogueAddColour from "./DialogueAddColour";
import DialogueAddImage from "./DialogueAddImage";
import DialogueChooseTemplate from "./DialogueChooseTemplate";
import DialogueText from "./DialogueText";
import DialogueProject from "./DialogueProject";
import DialogueAddPhonetics from "./DialogueAddPhonetics";
import DialogueConfirmNew from "./DialogueConfirmNew";
import DialogueOrientation from "./DialogueOrientation";
import DialogueMyAccount from "./DialogueMyAccount";
import DialogueUser from "./DialogueUser";
import DialogueUpdateProgress from "./DialogueUpdateProgress";

import CSSModules from 'react-css-modules';
import styles from '../styles';
// import DialogueEnterLicense from "./DialogueEnterLicense";

const App = () => {
	const view = useSelector(state => state.view);
	return (
		<>
    
            {(
                view.mode === eMode.SET_ORIENTATION
                || view.mode === eMode.CONFIRM_NEW
                || view.mode === eMode.OPEN_PROJECT
                || view.mode === eMode.SAVE_PROJECT
                || view.mode === eMode.ADD_IMAGE
                || view.mode === eMode.CHOOSE_TEMPLATE
            ) &&
                <div styleName="background-tint"/>
            }

            {view.mode === eMode.CONFIRM_NEW && <DialogueConfirmNew />}
            {view.mode === eMode.SET_ORIENTATION && <DialogueOrientation />}
            {(view.mode === eMode.SAVE_PROJECT || view.mode === eMode.SAVE_BEFORE_NEW) &&
                <DialogueProject mode='save' />
            }
            {view.mode === eMode.USER_SIGN_IN && <DialogueUser mode="sign-in" />}
            {view.mode === eMode.USER_REGISTER && <DialogueUser mode="sign-register" />}
            {view.mode === eMode.USER_OPTIONS && <DialogueUser mode="options" />}
            {view.mode === eMode.OPEN_PROJECT && <DialogueProject mode="open" />}
            {view.mode === eMode.EDIT_TEXT && <DialogueText />}
            {view.mode === eMode.ADD_IMAGE && <DialogueAddImage />}
            {view.mode === eMode.CHOOSE_TEMPLATE && <DialogueChooseTemplate />}
            {view.mode === eMode.COLOUR_IMAGE && <DialogueAddColour />}
            {view.mode === eMode.COLOUR_TEXT && <DialogueAddColour />}
            {view.mode === eMode.MY_ACCOUNT && <DialogueMyAccount />}
            {view.mode === eMode.APP_UPDATING && <DialogueUpdateProgress />}
            {view.showPhonetics && <DialogueAddPhonetics />}
            {/* {view.mode === eMode.SET_ORIENTATION && <DialogueOrientation/>} */}
           
		</>
	);
}


export default CSSModules(App, styles, {allowMultiple:true});



// export default App;
