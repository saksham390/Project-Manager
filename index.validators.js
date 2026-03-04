import {body} from "express-validator";
import{AvailableUserRole} from "../utils/constants.js";



const userRegisterValidator=()=>{


    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is req")
        .isEmail()
        .withMessage("email is invalid"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("username is req")
        .isLowercase()
        .withMessage("username must be in lowercase")
        .isLength({min:3})
        .withMessage("name atleast 3 characters long"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("password is req"),
        body("fullName")
        .optional()
        .trim()


    ];
};


const userLoginValidator=()=>{
    return[
        body("email")
        .optional()
        .isEmail()
        .withMessage("INVALID EMAIL"),
        body("password")
        .notEmpty()
        .withMessage("password is req")
    ]
};


const userChangeCurrentPasswordValidator=()=>{
    return[
        body("oldPassword").notEmpty().withMessage("OLD PASSWORD IS REQUIRED"),
        body("newPassword").notEmpty().withMessage("new password is required"),
    ];
};

const userForgotPasswordValidator=()=>{
     return[
        body("email")
        .notEmpty()
        .withMessage("email IS REQUIRED")
        .isEmail()
        .withMessage("email is invalid")

       
    ];
};
const resetForgotPasswordValidator=()=>{
    return[
        body("newPassword")
        .notEmpty()
        .withMessage("password is required")
    ];
};


const createProjectValidator=()=>{
    return[
        body("name")
        .notEmpty()
        .withMessage("name is required"),
        body("description")
        .optional()
];
};

const addMemberstoProjectValidator=()=>{
    return[
        body("email")
        .notEmpty()
        .withMessage("email is requires")
        .trim()
        .isEmail()
        .withMessage("invalid email"),
        body("role")
        .notEmpty()
        .withMessage("role is required")
        .isIn(AvailableUserRole)
        .withMessage("role is invalid")
    ];
};

export{
    userRegisterValidator,
    addMemberstoProjectValidator,
    createProjectValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    resetForgotPasswordValidator
};