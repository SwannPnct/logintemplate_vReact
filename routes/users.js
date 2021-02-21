var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

const User = require('./db/user_model');

const checkTokenValidity = (date) => {
  return date < Date.now() ? false : true
}

const checkEmailValidity = (email) => {
  const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailFormat.test(String(email).toLowerCase())
}

const checkPasswordStrength = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
  if (strongRegex.test(password)) {
    return 3
  } else if(mediumRegex.test(password)) {
    return 2
  } else {
    return 1
  }
}


router.post('/sign-up', async (req,res,next) => {

  //check if all input fields have been completed
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.json({result: false, error: "One or more field is missing."})
    return;
  }

  //check email format
  if(!checkEmailValidity(req.body.email)) {
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
  if (checkPasswordStrength(req.body.password) === 2 && !req.body.mediumSec) {
    res.json({result: false, medium: true, error: "Password security level is Medium. Are you sure you want this password?"})
    return;
  } else 
  if (checkPasswordStrength(req.body.password) != 3 && !req.body.mediumSec) {
    res.json({result: false, error: "Password security level too low"})
    return;
  }

  //encrypt by hashing and salting thanks to bcrypt package and saving user to DB
  await bcrypt.hash(req.body.password, 10, async (err,hash) => {
    if(err) {
      res.json({result: false, error: "There was an error creating your account."})
    } else {
      const newUser = new User({
        username : req.body.username,
        email : req.body.email,
        password : hash,
        lockout: {
          state : false,
          connectAttempt : 0
        },
        connect: {
          token: uid2(64),
          expirationDate: Date.now() + (3600000) * 4
        },
        reset: {
          token: null,
          expirationDate: null
        },
        emailVerified: false
      })
      const newSaved = await newUser.save();
    
      //sending email confirmation > in the future that needs to allow the confirmation of the email in the DB
      sgMail.send({
        to: newSaved.email,
        from: process.env.SENDER_ID,
        subject: "Welcome to Login Template",
        html: "Welcome " + newSaved.username
      })
      
      res.json({result:true, token : newSaved.connect.token})
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
    }
    user.connect.token = uid2(64);
    user.connect.expirationDate = Date.now() + (3600000) * 4
    await user.save();
    res.json({result:true, token: user.connect.token})
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
  const user = await User.findOne({"connect.token": req.query.token});
  if (!user || !checkTokenValidity(user.connect.expirationDate)) {
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

router.post('/forgot-password', async (req,res,next) => {
  if (!req.body.email || !checkEmailValidity(req.body.email)) {
    res.json({result: false, error : "Please enter an email."})
    return
  }
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    res.json({result: true, message : "An email has been sent to this email for you to reset your password."})
  } else {
    user.reset.token = uid2(64)
    user.reset.expirationDate = Date.now() + 3600000
    await user.save()
    sgMail.send({
      to: user.email,
      from: process.env.SENDER_ID,
      subject: "Your password reset request",
      html: `
      <h5>Password reset request</h5>
      <p>Follow below link to reset your password:</p><br/>
      <a href="http://localhost:3001/reset-password/${user.reset.token}">Reset your password</a>
      `
    })
    res.json({result: true, message : "An email has been sent to this email for you to reset your password."})
  }
})

router.get("/check-token", async (req,res,next) => {
  if (!req.query.token) {
    res.json({result:false})
    return
  }
  const user = await User.findOne({"connect.token": req.query.token})
  if (!user) {
    res.json({result:false})
  } else {
    checkTokenValidity(user.connect.expirationDate) ? res.json({result:true}) : res.json({result:false})
  }
})

router.post('/reset-password', async (req,res,next) => {
  const user = await User.findOne({"reset.token" : req.body.token})
  if (!user) {
    res.json({result:false, error: "There was an issue resetting your password."})
  } else {
    if (!checkTokenValidity(user.connect.expirationDate)) {
      res.json({result:false, error: null})
    } else {
      const oldPasswordCheck = await bcrypt.compare(req.body.password, user.password);
      if (oldPasswordCheck) {
        res.json({result:false, error: "You can't choose a password you've used previously."})
      } else {
        if (checkPasswordStrength(req.body.password) === 2 && !req.body.mediumSec) {
          res.json({result: false, medium: true, error: "Password security level is Medium. Are you sure you want this password?"})
          return;
        } else 
        if (checkPasswordStrength(req.body.password) != 3 && !req.body.mediumSec) {
          res.json({result: false, error: "Password security level too low"})
          return;
        }
        await bcrypt.hash(req.body.password, 10, async (err, hash) => {
          if (err) {
            res.json({result:false, error: "There was an issue resetting your password."})
          } else {
            user.password = hash
            user.reset.token = null
            await user.save()
            res.json({result: true})
          }
        })
      }
    }
  }
})

module.exports = router;
