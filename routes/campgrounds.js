const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const flash = require('connect-flash');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id; // 將使用者id存入campground中
  await campground.save();
  req.flash('success', 'Make a new campground successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground });
}))

router.get('/:id', catchAsync(async (req, res) => {
  // 使用 populate() 將reviews和authors的 ObjectId 轉為資料
  const campground = await Campground.findById(req.params.id).populate({
    // 使用巢狀解析出每個review中的author資訊
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Update campground successfully!')
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Delete a campground successfully!');
  res.redirect('/campgrounds');
}))

module.exports = router;