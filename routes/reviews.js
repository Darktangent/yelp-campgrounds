const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { Review } = require('../models/review');
const { reviewSchema } = require('../schemas');
const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');

		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.post(
	'/',
	validateReview,
	catchAsync(async (req, res, next) => {
		const camp = await Campground.findById(req.params.id);
		const review = await new Review(req.body.review);
		camp.reviews.push(review);
		await review.save();
		await camp.save();
		req.flash('success', 'Review added');
		res.redirect(`/campgrounds/${camp._id}`);
	})
);
router.delete(
	'/:rId',

	catchAsync(async (req, res, next) => {
		const { id, rId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: rId } });
		await Review.findByIdAndDelete(rId);
		req.flash('success', 'Successfully deleted review');
		res.redirect(`/campgrounds/${campId}`);
	})
);
module.exports = router;
