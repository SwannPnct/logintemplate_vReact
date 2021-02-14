var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

const User = require('./db/user_model');

router.post('/sign-up', async (req,res,next) => {

  //check email format
  const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const emailFormatCheck = emailFormat.test(String(req.body.email).toLowerCase());
  if(!emailFormatCheck) {
    res.json({result: false, error: "You've not entered an email."})
    return;
  }

  //check if email already exists in DB
  const check = await User.findOne({email: req.body.email});
  if(check) {
    res.json({result: false, error: "This user already exists"})
    return;
  }

  //check password strength, for medium strength > asks for confirmation, decline low strength
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
  //if (mediumRegex.test(req.body.password)) {
  //  res.json({result: false, medium: true, error: "Password security level : Medium"})
  //  return;
 // } else 
  if (!strongRegex.test(req.body.password) && !mediumRegex.test(req.body.password)) {
    res.json({result: false, medium: false, error: "Password security level too low"})
    return;
  }

  //encrypt by hashing and salting thanks to bcrypt package and saving user to DB
  await bcrypt.hash(req.body.password, 10, async (err,hash) => {
    if(err) {
      res.json({result: false, error: err})
    } else {
      const newUser = new User({
        username : req.body.username,
        email : req.body.email,
        password : hash,
        lockout: {
          state : false,
          connectAttempt : 0
        },
        token: uid2(64)
      })
      const newSaved = await newUser.save();
    
      res.json({result:true, token : newSaved.token})
    }
  })
})

router.post('/sign-in', async (req,res,next) => {

  const user = await User.findOne({email: req.body.email})
  if (!user) {
    res.json({result:false, error: "Wrong credentials"});
    return;
  } else if (user.lockout.state) {
    res.json({result:false, error: "Account locked"});
    return;
  }
  const passwordCheck = await bcrypt.compare(req.body.password, user.password);
  if(passwordCheck) {
    if (user.lockout.connectAttempt > 0) {
      user.lockout.connectAttempt = 0;
      await user.save();
    }
    res.json({result:true, token: user.token})
  } else {
    user.lockout.connectAttempt++;
    if (user.lockout.connectAttempt >= 10) {
      user.lockout.state = true;
    }
    await user.save();
    res.json({result:false, error: "Wrong credentials"})
    return;
  }
  
})

router.get('/get-info', async (req,res,next) => {
  const user = await User.findOne({token: req.query.token});
  if (!user) {
    res.json({result: false, error: "There was an issue fetching your infos. Please login again."});
    return;
  }
  const info = {
    username: user.username,
    email: user.email
  }
  res.json({result: true, info})
})

router.get('/sign-out', (req,res,async) => {
  
})

module.exports = router;
