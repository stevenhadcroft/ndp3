import { combineReducers } from "redux";
import view from "./view";
import canvas from "./canvas";

export default combineReducers({
	canvas,
	view,
});
