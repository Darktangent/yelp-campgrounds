const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');
const router = express.Router();

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');

		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get('/', async (req, res, next) => {
	try {
		const camps = await Campground.find({});
		res.render('campgrounds/index', { camps });
	} catch (er) {
		next(err);
	}
});
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});
router.get(
	'/:id',

	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findById(id).populate('reviews');
		if (!camp) {
			req.flash('error', `Cannnot find that campground`);
			res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { camp });
	})
);
router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!res.body.campground) {
		// 	throw new ExpressError('Invalid Campground data', 400);
		// }

		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', 'Successfully made a new Campground');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
// render edit
router.get('/:id/edit', isLoggedIn, async (req, res, next) => {
	try {
		const { id } = req.params;
		const camp = await Campground.findById(id);
		if (!camp) {
			req.flash('error', `Cannnot find that campground`);
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { camp });
	} catch (err) {
		next(err);
	}
});
// edit camp handle response
router.put(
	'/:id',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', `Successfully updated campground`);
		res.redirect(`/campgrounds/${camp._id}`);
	})
);
router.delete('/:id', isLoggedIn, async (req, res) => {
	try {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted campground');
		res.redirect('/campgrounds');
	} catch (err) {
		next(err);
	}
});
module.exports = router;
