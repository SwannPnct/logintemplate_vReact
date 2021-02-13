var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const User = require('./db/user_model');

router.get('/login', (req,res,next) => {
  if (req.session.userId) {
    res.redirect('/users/info')
  }
  res.render('login', {
    wrongCred : req.session.wrongCred,
    lockout: req.session.lockout
  });
})

router.post('/sign-up', async (req,res,next) => {

  //check email format
  const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const emailFormatCheck = emailFormat.test(String(req.body.email).toLowerCase());
  if(!emailFormatCheck) {
    console.log("not an email");
    res.redirect('/users/login');
    return;
  }

  //check if email already exists in DB
  const check = await User.findOne({email: req.body.email});
  if(check) {
    res.redirect('/users/login');
    return;
  }

  //check password strength, for medium strength > asks for confirmation, decline low strength
  const strongRegex = new RegExp ("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  const mediumRegex = new RegExp ("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
  if (mediumRegex.test(req.body.pw)) {
    console.log("medium pw, ask to confirm");
  } else if (!strongRegex.test(req.body.pw)) {
    console.log("security too weak");
    res.redirect('/users/login');
    return;
  }

  //encrypt by hashing and salting thanks to bcrypt package and saving user to DB
  await bcrypt.hash(req.body.pw, 10, async (err,hash) => {
    if(err) {
      console.log(err);
      res.redirect('/users/login');
    } else {
      const newUser = new User({
        username : req.body.username,
        email : req.body.email,
        password : hash,
        lockout: {
          state : false,
          connectAttempt : 0
        }
      })
      const newSaved = await newUser.save();
      req.session.userId = newSaved._id;
    
      res.redirect('/users/info');
    }
  })
})

router.post('/sign-in', async (req,res,next) => {

  const user = await User.findOne({email: req.body.email})
  if (!user) {
    console.log("wrong credentials");
    req.session.wrongCred = true;
    res.redirect('/login');
    return;
  } else if (user.lockout.state) {
    console.log("account locked");
    req.session.lockout = true;
    res.redirect('/login');
    return;
  }
  const passwordCheck = await bcrypt.compare(req.body.pw, user.password);
  if(passwordCheck) {
    console.log("connected");
    req.session.wrongCred = false;
    if (user.lockout.connectAttempt > 0) {
      user.lockout.connectAttempt = 0;
      await user.save();
    }
    req.session.userId = user._id;
    res.redirect('/users/info');
  } else {
    console.log("wrong credentials");
    req.session.wrongCred = true;
    user.lockout.connectAttempt++;
    if (user.lockout.connectAttempt >= 10) {
      user.lockout.state = true;
    }
    await user.save();
    res.redirect('/login');
    return;
  }
  
})

router.get('/info', async (req,res,next) => {
  if (!req.session.userId) {
    console.log('user not connected');
    res.redirect('/users/login');
    return;
  }
  const user = await User.findById(req.session.userId);
  res.render('info',{username : user.username});
})

router.get('/sign-out', (req,res,async) => {
  req.session.userId = null;
  res.redirect('/users/login');
})

module.exports = router;
