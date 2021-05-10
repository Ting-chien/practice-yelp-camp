const express = require('express');
const router = express.Router({mergeParams: true}); // 讓 url 參數可以傳進來
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      console.log(error)
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

router.post('/', validateReview, catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Create a new review successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
  // 607b0928f90e21837363a3f9
}))

// 刪除留言
router.delete('/:reviewId', catchAsync(async(req, res) => {
  const { id, reviewId } = req.params;
  Campground.findById(id, { $pull: { reviews: reviewId }}) // 使用 $pull syntax 將符合條件的取出
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Delete a review successfully!');
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;