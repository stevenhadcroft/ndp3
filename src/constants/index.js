// import ConstantsImages from "./Constants-Images";
// import ConstantsTemplates from "./Constants-Templates";

const STORAGE_APPEND_ID = "24";

export const eDirection = {
	LEFT:"left",
	RIGHT:"right",
	UP:"up",
	DOWN:"down",
	IN:"in",
	OUT:"out",
	RESET:"reset",
}

export const eSearchLogic = {
	BEGINS:"begins",
	CONTAINS:"contains"
}

export const eSearchFilter = {
	PICTURE:"Stitle",
	SOUND:"Ssound",
	PHONETIC:"Sphon"
}

export const Constants = {
    POT_SIZE : 135,
    
    MODE_USER_SIGN_IN : "mode-user-sign-IN",
    MODE_USER_REGISTER : "mode-user-register",
    MODE_USER_OPTIONS : "mode-user-options",
    MODE_USER_ACTIVE : "mode-user-active",
    MODE_USER_PENDING : "mode-user-pending",

    MODE_NEW_PROJECT : "mode-new-projeMODE_USER_SIGN_UPct",
    MODE_OPEN_PROJECT : "mode-open-project",
    MODE_SAVE_PROJECT : "mode-save-project",
    MODE_SAVE_BEFORE_NEW : "mode-save-before-new",
    MODE_PRINT_PROJECT : "mode-print-project",
    MODE_ADD_IMAGE : "mode-add-image",
    MODE_EDIT_IMAGE : "mode-edit-image",
    // MODE_EDIT_IMAGE_STORE_HISTORY : "mode-edit-image-store-history",
    MODE_CHOOSE_TEMPLATE : "mode-choose-template",
    MODE_EDIT_TEMPLATE : "mode-edit-template",
    MODE_ADD_TEXT : "mode-add-text",
    MODE_EDIT_TEXT : "mode-edit-text",
    MODE_COLOUR_IMAGE : "mode-colour-image",
    MODE_COLOUR_TEXT : "mode-colour-text",
    MODE_MY_ACCOUNT : "mode-my-account",
    MODE_CONFIRM_DELETE : "mode-confirm-delete",
    MODE_CONFIRM_NEW : "mode-confirm-new",
    MODE_SET_ORIENTATION : "mode-set-orientation",

    LOCAL_DATA_CONFIG: "ndp3Data_config_"+STORAGE_APPEND_ID,
    LOCAL_DATA_FILES_ID: "ndp3Data_files_"+STORAGE_APPEND_ID,
    LOCAL_DATA_PROJECTS_ID: "ndp3Data_projects_"+STORAGE_APPEND_ID,

    API_URL: "http://www.berthasworkers.com/dev/ndp3v2/php/",

    // IMAGES:ConstantsImages, 
    // TEMPLATES:ConstantsTemplates, 
    	
    IMAGE_CATEGORIES: [
        {title:"All word categories", id:"All"},
        {title:"Single Consonant", id:"cons"},
        {title:"Single Vowel", id:"vow"},
        {title:"CV words", id:"CVword"},
        {title:"VC words", id:"VCword"},
        {title:"CVC words", id:"CVCword"},
        {title:"CVCV ending cues", id:"CVCVend"},
        {title:"CVCV characters", id:"CVCVchar"},
        {title:"CVCVC verbs", id:"CVCVCverb"},
        {title:"CVCV words", id:"CVCVword"},
        {title:"CVCVC words", id:"CVCVCword"},
        {title:"Multisyllabic", id:"msyl"},
        {title:"/s/ clusters", id:"Sclus"},
        {title:"/i/ clusters", id:"Iclus"},
        {title:"/r/ clusters", id:"Rclus"},
        {title:"Medial clusters", id:"medial"},
        {title:"Final clusters", id:"final"},
        {title:"2 Word phrases & sentences", id:"words2"},
        {title:"Everyday phrases", id:"every"},
        {title:"Complex sentences", id:"complex"},
        {title:"Articulograms", id:"artic"},
        {title:"Jolly", id:"jolly"},
        {title:"Assessment", id:"asses"},    
    ],

    WORKSHEET_CATEGORIES: [
        {title:"All", id:""},
        {title:"Sequencing", id:"Wseq"},
        {title:"Transition", id:"trans"},
        {title:"Voice", id:"voice"},
        {title:"Grids", id:"grids"},
        {title:"Cards and Stickers", id:"card"}, 
        {title:"Games", id:"games"}, 
    ],

    FONTLIST: ["Serif", "Monospace", "Verdana", "Impact"],

    PHONETICS: [
        {symbol:"ɨ"},
        {symbol:"ɐɪ"},
        {symbol:"æ"},
        {symbol:null},
        {symbol:"p"},
        {symbol:"m"},
        {symbol:"j"},
        {symbol:"s"},
        
        {symbol:"ɑ"},
        {symbol:"ɔɪ"},
        {symbol:"ɪ"},
        {symbol:null},
        {symbol:"b"},
        {symbol:"n"},
        {symbol:"h"},
        {symbol:"z"},
        
        {symbol:"u"},
        {symbol:"ɑʊ"},
        {symbol:"ʊ",},
        {symbol:null},
        {symbol:"t"},
        {symbol:"ɳ"},
        {symbol:"f"},
        {symbol:"ʃ"},
        
        {symbol:"ɔ"},
        {symbol:"əʊ"},
        {symbol:"ʊ"},
        {symbol:null},
        {symbol:"d"},
        {symbol:"w"},
        {symbol:"v"},
        {symbol:"ʒ"},
        
        {symbol:"ɜ"},
        {symbol:"ɛə"},
        {symbol:"ɛ"},
        {symbol:null},
        {symbol:"c/k"},
        {symbol:"ǀ"},
        {symbol:"θ"},
        {symbol:"tʃ"},
        
        {symbol:"ɑɪ"},
        {symbol:"ɪə"},
        {symbol:"ʌ"},
        {symbol:"ə"},
        {symbol:"g"},
        {symbol:"r"},
        {symbol:"ð"},
        {symbol:"dʒ"},
    ],
}

