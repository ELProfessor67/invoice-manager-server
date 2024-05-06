import catchAsyncError from '../middlewares/catchAsyncError.js';
import UserModel from '../models/user.js'; 
import sendResponse from '../utils/sendResponse.js';
import {sendToken} from '../utils/sendToken.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import fs from 'fs';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url))

export const register = catchAsyncError(async (req, res) => {
	const {name, email, password} = req.body;
	console.log('body',req.body);
	const isExist = await UserModel.findOne({email});
	if(isExist) return sendResponse(false, 401, 'Email already exist',res);
	if(!name, !email, !password){
		return sendResponse(false, 401, 'All fields are required',res);
	}


	const user = await UserModel.create({
		name: name,
		email: email,
		password: password,
		googleId: Date.now()+3,
		facebookId: Date.now()+9
	});

	res.status(201).json({
		success: true,
		message: 'Registered Successfully'
	})
});


export const login = catchAsyncError(async (req, res, next) => {
	console.log('login',req.body)
	const {email, password} = req.body;
	if(!email || !password) return sendResponse(false, 401, 'All fields are required',res);
	let user = await UserModel.findOne({email});

	if (!user)
      return sendResponse(false, 401, 'Incorrect Email or Password',res);

	const isMatch = await user.comparePassword(password);
    if (!isMatch)
		return sendResponse(false, 401, 'Incorrect Email or Password',res);
  
    sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

export const loadme = catchAsyncError(async (req, res, next) => {
	
	res.status(200).json({
		success: true,
		user: req.user
	})
	
});

export const logout = catchAsyncError(async (req, res, next) => {
	res.clearCookie("token");
		res.status(200).json({
		  message: "Logged Out",
	});
});

export const updateUser = catchAsyncError(async (req, res, next) => {
	const {name, email,_id} = req.body;
	const user = await UserModel.findByIdAndUpdate(_id,{name,email});
	
	sendResponse(true,200,'Update successfully',res);
});

export const changePassword = catchAsyncError(async (req, res, next) => {
	const {newpassword,_id} = req.body;
	const user = await UserModel.findById(_id);

	user.password = newpassword;
	await user.save();
  
    sendResponse(true,200,'Password update successfully',res);
});


// forgot password 
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    // console.log(email)

    const user = await UserModel.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;
    // Send token via email
    // await sendEmail(user.email, "HG Streaming Reset Password", message);
	console.log(url);
	sendResponse(true,200,`Reset Token has been sent to ${user.email}`,res);
  });

// reset password 
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
  
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
  
    if (!user)
      return next(new ErrorHandler("Token is invalid or has been expired", 401));
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
	sendResponse(true,200,"Password Changed Successfully",res);
  });

  export const alluser = catchAsyncError(async (req, res, next) => {
    const alluser = await UserModel.find({role: 'user'});
	res.status(200).json({
		alluser,
		success: true
	})
  });