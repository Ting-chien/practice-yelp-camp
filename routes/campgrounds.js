const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const flash = require('connect-flash');

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
      console.log(error)
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', catchAsync(async (req, res) => {
  res.render('campgrounds/new');
}))

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash('success', 'Make a new campground successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground });
}))

router.get('/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews'); // 使用 populate() 將 ObjectId 轉為資料
  if (!campground) {
    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', { campground });
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Update campground successfully!')
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Delete a campground successfully!');
  res.redirect('/campgrounds');
}))

module.exports = router;