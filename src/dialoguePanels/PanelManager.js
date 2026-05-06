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

import { cx } from '../styles';

const PANELS = {
    [eMode.CONFIRM_NEW]:      { component: DialogueConfirmNew,     tinted: true  },
    [eMode.SET_ORIENTATION]:  { component: DialogueOrientation,    tinted: true  },
    [eMode.SAVE_PROJECT]:     { component: DialogueProject,        tinted: true,  props: { mode: 'save' } },
    [eMode.SAVE_BEFORE_NEW]:  { component: DialogueProject,        tinted: false, props: { mode: 'save' } },
    [eMode.OPEN_PROJECT]:     { component: DialogueProject,        tinted: true,  props: { mode: 'open' } },
    [eMode.USER_SIGN_IN]:     { component: DialogueUser,           tinted: false, props: { mode: 'sign-in' } },
    [eMode.USER_REGISTER]:    { component: DialogueUser,           tinted: false, props: { mode: 'sign-register' } },
    [eMode.USER_OPTIONS]:     { component: DialogueUser,           tinted: false, props: { mode: 'options' } },
    [eMode.EDIT_TEXT]:        { component: DialogueText,           tinted: false },
    [eMode.ADD_IMAGE]:        { component: DialogueAddImage,       tinted: true  },
    [eMode.CHOOSE_TEMPLATE]:  { component: DialogueChooseTemplate, tinted: true  },
    [eMode.COLOUR_IMAGE]:     { component: DialogueAddColour,      tinted: false },
    [eMode.COLOUR_TEXT]:      { component: DialogueAddColour,      tinted: false },
    [eMode.MY_ACCOUNT]:       { component: DialogueMyAccount,      tinted: false },
    [eMode.APP_UPDATING]:     { component: DialogueUpdateProgress, tinted: false },
};

const App = () => {
    const view = useSelector(state => state.view);
    const panel = PANELS[view.mode];
    const Panel = panel?.component;

    return (
        <>
            {panel?.tinted && <div className={cx("background-tint")} />}
            {Panel && <Panel {...(panel.props || {})} />}
            {view.showPhonetics && <DialogueAddPhonetics />}
        </>
    );
}

export default App;
