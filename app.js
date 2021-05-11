const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const Joi = require('joi');
const flash = require('connect-flash');
// const { campgroundSchema, reviewSchema } = require('./schemas');

const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const campground = require('./models/campground');
const campgrounds = require('./routes/camgrounds');
const reviews = require('./routes/reviews');
// mongoose

mongoose
	.connect('mongodb://localhost:27017/yelp-camp', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: '*****',
		resave: false,
		saveUninitialized: true,
		cookie: {
			expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true,
		},
	})
);
app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// routes
app.get('/', (req, res) => {
	res.render('home');
});

// review

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
