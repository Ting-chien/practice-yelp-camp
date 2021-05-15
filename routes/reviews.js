const express = require('express');
const router = express.Router({mergeParams: true}); // 讓 url 參數可以傳進來
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Create a new review successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

// 刪除留言
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
  const { id, reviewId } = req.params;
  Campground.findById(id, { $pull: { reviews: reviewId }}) // 使用 $pull syntax 將符合條件的取出
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Delete a review successfully!');
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;