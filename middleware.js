const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');

// 使用isLoggedIn middleware來確保特定操作時是已登入之使用者
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 使用req.path或eq.originalUrl，可以印出當下所在路徑
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must sign in!');
    return res.redirect('/login');
  }
  next();
}

// 檢查新增或修改的campground資料是否符合資料庫格式
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    console.log(error)
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

// 將該方法抽離出來，作為驗證操作者是否具有編輯權限的middleware
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp.author.equals(req.user._id)) {
    req.flash('error', 'You don\'t have permission.')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You don\'t have permission.')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      console.log(error)
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}