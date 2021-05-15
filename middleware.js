module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 使用req.path或eq.originalUrl，可以印出當下所在路徑
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must sign in!');
    return res.redirect('/login');
  }
  next();
}