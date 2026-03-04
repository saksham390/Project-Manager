import {Router} from "express";
import {registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    changeCurrentPassword,
    resetForgotPassword} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {   userRegisterValidator,
    addMemberstoProjectValidator,
    createProjectValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    resetForgotPasswordValidator } from "../validators/index.validator.js";
import{verifyJWT,validateProjectPermission} from"../middlewares/auth.middleware.js";
 import{deleteMember,
    updateMemberRole,
    getProjectMembers,
    createProject,
    deleteProject,
    updateProject,
    getProjects,
    getProjectById,
    addMemberstoProject}from "../controllers/project.controllers.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.models.js";



const router=Router()
router.use(verifyJWT)


router
.route("/")
.get(getProjects)
.post(createProjectValidator(),validate,createProject)

router
.route("/:projectId")
.get(validateProjectPermission(AvailableUserRole),getProjectById)
.put(validateProjectPermission([UserRolesEnum.ADMIN]),createProjectValidator(),validate,updateProject)
.delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteProject
)

router 
.route("/:projectId/members")
.get(getProjectMembers)
.post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemberstoProjectValidator(),
    validate,
    addMemberstoProject
)

router 
.route("/projectId/members/:userId")
.put(validateProjectPermission([UserRolesEnum.ADMIN]),
updateMemberRole)
.delete(validateProjectPermission([UserRolesEnum.ADMIN]).deleteMember);

export default router