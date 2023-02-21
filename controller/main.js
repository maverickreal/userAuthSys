const router = require('express').Router();
const verifyToken = require('../models/token.js');
const handles = require('../handlers/main.js');

router.post('/api/signup', handles.postSignup);
router.post('/api/signin', handles.postSignin);
router.post('/api/signout', verifyToken, handles.postSignout);
router.put('/api/user', verifyToken, handles.putUser);
router.post('/api/password', verifyToken, handles.postPassword);

module.exports = router;