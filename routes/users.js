const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', catchAsync(async(req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registerdUser = await User.register(user, password);
    // 使用login()方法，來自動將註冊後的帳號登入
    req.login(registerdUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Yelp Camp!');
      res.redirect('/campgrounds');
    });
  } catch(e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}));

// 設定登入頁面路由
router.get('/login', (req, res) => {
  res.render('users/login');
});

// 設定登入路由，並將passport提供的middleware加入
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (req, res) => {
  req.flash('success', 'Welcom Baclk!');
  // 利用session.returnTo裡面儲存現在所在的url位置，來回到登入前的頁面
  const redirectUrl = req.session.returnTo || '/campgrounds';
  // 使用完畢後將其銷毀
  delete req.session.returnTo;
  res.redirect(redirectUrl); 
})

// 透過logout()來登出使用者資訊
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully log out!');
  res.redirect('/campgrounds');
})

module.exports = router;