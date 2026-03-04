import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/api_response.js";
import {asyncHandler} from "../utils/async-handler.js";
import {ApiError} from "../utils/api_error.js";
import {   emailVerificationMailgenContent,
    forgotPasswordMailgenContent,sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
const generateAccessandRefreshTokens=async(userId)=>{
    try {
      const user=  await User.findById(userId)
      const accessToken=user.generateAccessToken();
      const refreshToken=user.generateRefreshToken();


      user.refreshToken=refreshToken
      await user.save(
        {validateBeforeSave:false}
      )
      return{
        accessToken,refreshToken
      }
    } catch (error) {
        throw new ApiError(500,"something went wrong");
        
    }
};



const registerUser=asyncHandler(async(req,res)=>{
   const{email,username,passoword,role} =req.body;

  const existedUser=await User.findOne({
    $or:[{username},{email}]
   })

   if(existedUser){
    throw new ApiError(409,"user with email or username already exsists",[])
   }

  const user=await  User.create({
    email,
    paassword,
    username,
    isEmailVerified:false

   })

   const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

   user.emailVerificationToken=hashedToken
   user.emailVerificationExpiry=tokenExpiry
   await user.save({validateBeforeSave:false})

   await sendEmail({
    email:user?.email,
    subject:"please verify your email",
    mailgenContent:emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
         ),
   });

   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
   );

   if(!createdUser){
    throw new ApiError(500,"something went wrong while registring a user");
   }
   return res
   .status(201)
   .json(
    new ApiResponse(
        200,
        {user:createdUser},
        "User registered Successfully"
    ),
   )

});


const login=asyncHandler(async(req,res)=>{

  const{email,password,username}=req.body()

  if(!username || !email){
    throw new ApiError(400,"name and email is required")
  }


  const user=await User.findOne({email});
  if(!user){
    throw new ApiError(400,"user not exsists")

  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(400,"password invalid ")
  }

 const{accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

const loggedInUser=await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
   );

  const option={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggesInUser,
        accessToken,
        refreshToken
      },
      "user logged in successfully"
    )
  )



});



const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      refreshToken:""
    }
  },
  {
    new:true
  },

);

const options=
{
  httpOnly:true,
  secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(
  new ApiResponse(200,{},"User logged out")
)

});









const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "current user fetched successully"
    )
  );
});

const verifyEmail=asyncHandler(async(req,res)=>{
  const{verificationToken}=req.params

  if(!verificationToken){
    throw new ApiError(400,"email verification token is missing");
  }

  let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    const user=await User.findOne({
      emailVerificationToken:hashedToken,
      emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user){
       throw new ApiError(400,"token is invalid")
    }

    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          isEmailVerified:true
        },
        "Email is verified",
      )
    )
  });

const resendEmailVerification=asyncHandler(async(req,res)=>{
const user=await User.findById(req.user?._id);
if(!user){
  throw new ApiError(404,"user not exsist")
}

if(user.isEmailVerified){
  throw new ApiError(409,"email is already verified")
}
 const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

   user.emailVerificationToken=hashedToken
   user.emailVerificationExpiry=tokenExpiry
   await user.save({validateBeforeSave:false})

   await sendEmail({
    email:user?.email,
    subject:"please verify your email",
    mailgenContent:emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
         ),
   });
   return res
   .status(200)
   .json(
    new ApiResponse(
      200,
      {},
      "mail has sent"
    )
   )
});


const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=res.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){

    throw newApiError(401,"unauthorizes access")
  }

  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

   const user=await User.findById(decodedToken?._id);
   if(!user){
    throw new ApiError(401,"invalid refresh token")
   }

   if(incomingRefreshToken!==user?.refreshToken){
    throw new ApiError(401,"refresh token is expired")
  
   }

   const options={
    httpOnly:true,
    secure:true,
   }


   const{accessToken,refreshToken:newRefreshToken}=await generateAccessandRefreshTokens(user._id)
   user.refreshToken=newRefreshToken;
   await user.save()
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
    new ApiResponse(
      200,
      {accessToken,refreshToken:newRefreshToken},
      "Access token refreshed"
    )

   )

   
    
  } catch (error) {
    throw new ApiError(401,"invalid refresh token");
    
  }
});


const forgotPasswordRequest=asyncHandler(async(req,res)=>{
  const{email}=req.body

  const user=await User.findOne({email})

  if(!user){
    throw new ApiError(404,"user not exsists")
  }

  const{unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();


  user.forgotPasswordToken=hashedToken
  user.forgotPasswordExpiry=tokenExpiry

  await user.save({validateBeforeSave:false})

  await sendEmail({
    email:user?.email,
    subject:"password reset request",
    mailgenContent:forgotPasswordMailgenContent(
        user.username,
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
         ),
  });

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "password reset mail has been sent on your mail"
    )
  )
});


const resetForgotPassword=asyncHandler(async(req,res)=>{
  const{resetToken}=req.params
  const{newPassword}=req.body
  let hashedToken=crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex")

  const user=await User.findOne({
    forgotPasswordToken:hashedToken,
    forgotPasswordExpiry:{$gt:Date.now()}
  })
  if(!user){
    throw new ApiError(489,"token is invalid and expired")
  }

  user.forgotPasswordExpiry=undefined
  user.forgotPasswordToken=undefined

  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
    200,
    {},
    "password reset successfully")
  );

});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword}=req.body



 const user=await User.findById(req.user?._id);

 const isPasswordValid=await user.isPasswordCorrect(oldPassword)

 if(!isPasswordValid){
  throw new ApiError(400,"invalid old password")
 }

 user.password=newPassword
 await user.save({validateBeforeSave:false})

 return res
 .status(200)
 .json(
  new ApiResponse(
    200,
    {},
    "password changes succesfully"
  )
 );
});


export{
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    changeCurrentPassword,
    resetForgotPassword
};
