const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');

// mongoose

mongoose
	.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Mongo Connection established');
	})
	.catch((err) => {
		console.log('Mongo Error Occured');
		console.log(err);
	});
// mongoose end
const app = express();
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// setup ejs and path to views dir
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');

		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
// routes
app.get('/', (req, res) => {
	res.render('home');
});
app.get('/campgrounds', async (req, res, next) => {
	try {
		const camps = await Campground.find({});
		res.render('campgrounds/index', { camps });
	} catch (er) {
		next(err);
	}
});
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});
app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findById(id);
		res.render('campgrounds/show', { camp });
	})
);
app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!res.body.campground) {
		// 	throw new ExpressError('Invalid Campground data', 400);
		// }

		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
// render edit
app.get('/campgrounds/:id/edit', async (req, res, next) => {
	try {
		const { id } = req.params;
		const camp = await Campground.findById(id);
		res.render('campgrounds/edit', { camp });
	} catch (err) {
		next(err);
	}
});
// edit camp handle response
app.put(
	'/campgrounds/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect(`/campgrounds/${camp._id}`);
	})
);
app.delete('/campgrounds/:id', async (req, res) => {
	try {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	} catch (err) {
		next(err);
	}
});
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not found', 404));
});
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something went wrong...';
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log(`Serving on pport 3000`);
});
