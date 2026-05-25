import express from 'express';
const router = express.Router();
import { signup, login, getMe, updateProfile, requestDeleteAccount, reactivateAccount, updateAccountData } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

router.post('/signup', signup);
router.post('/login', login);
router.post('/update-profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMe);
router.post('/rqa',verifyToken ,requestDeleteAccount);
router.post('/reactivate', reactivateAccount);
router.post('/update-account', verifyToken , updateAccountData);


export default router;

