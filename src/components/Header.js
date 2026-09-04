import { useSelector, useDispatch } from "react-redux";
import { makeCx } from "../styles";
import buttonStyles from "../styles/buttons.module.css";
import menuStyles from "../styles/menu.module.css";
import uiStyles from "../styles/ui.module.css";

import { setMenuOpen } from "../features/viewSlice";

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };
const cx = makeCx(styleModules);

const Header = (props) => {
  const view = useSelector((state) => state.view);
  const canvas = useSelector((state) => state.canvas);
  const dispatch = useDispatch();

  const projectLabel = canvas.projectName
    ? `${canvas.projectName}${canvas.modified ? ' *' : ''}`
    : '(Project unsaved)';

  const onMenuOpen = () => {
    dispatch(setMenuOpen(!view.showMenuPopup));
  };

  const imgsrc = view.showMenuPopup ? "./imgs/gui/close.png" : "./imgs/gui/menu.png";
  const headstr = view.showMenuPopup ? <span style={{marginLeft:"-16px"}}>Close menu</span> : <><strong>NDP3</strong><sup>&reg;</sup> Speech Builder</>;

  return (
    <header>
      {!view.fullScreen &&
      <div className={cx("menu-header")}>
        {view.userIsAuth &&
          <button className={cx("menutab")} onClick={onMenuOpen}><img src={imgsrc} alt=""/></button>
        }
        <button className={cx("menutab")} >
          <span className={cx("title")}>{headstr}</span>
        </button>
        {view.userIsAuth &&
          <span className={cx(`project-name ${canvas.modified ? "modified" : ""}`)}>{projectLabel}</span>
        }
      </div>
      }
    </header>
  );
};

export default Header;
