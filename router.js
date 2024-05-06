import express from 'express';
import passport from 'passport';
const router = express.Router();
import UserModel from './models/user.js';
import {changePassword, loadme, login, logout, register, updateUser,forgotPassword,resetPassword, alluser} from './controllers/user.js';
import { isAuthenticate, isCheckRole } from './middlewares/auth.js';
import { AddInvoice, UpdateInvoice, deleteInvoice, getInvoicesByDate, readInvoice } from './controllers/invoices.js';

router.get('/',(req,res) => {
    res.send(process.env.PORT);
})

// users routes
router.route('/register').post(isAuthenticate,isCheckRole('admin'),register);
router.route('/users').get(isAuthenticate,isCheckRole('admin'),alluser);
router.route('/login').post(login);
router.route('/me').get(isAuthenticate,loadme);
router.route('/logout').get(logout);
router.route('/user/update').put(isAuthenticate,updateUser);
router.route('/user/change-password').put(isAuthenticate,changePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);


// invoide routes
router.route('/invoice').post(isAuthenticate,AddInvoice);
router.route('/invoice/:id').put(isAuthenticate,UpdateInvoice);
router.route('/invoice/:id').delete(isAuthenticate,deleteInvoice);
router.route('/invoice/').get(isAuthenticate,readInvoice);
router.route('/invoice/date/:date').get(isAuthenticate,getInvoicesByDate);



export default router;