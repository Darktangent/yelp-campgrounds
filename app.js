const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
// mongoose
const mongoose = require('mongoose');
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
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// setup ejs and path to views dir
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// routes
app.get('/', (req, res) => {
	res.render('home');
});
app.get('/campgrounds', async (req, res) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index', { camps });
});
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});
app.get('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show', { camp });
});
app.post('/campgrounds', async (req, res) => {
	const campground = new Campground(req.body.campground);
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
});
// render edit
app.get('/campgrounds/:id/edit', async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/edit', { camp });
});
// edit camp handle response
app.put('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	res.redirect(`/campgrounds/${camp._id}`);
});
app.delete('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	res.redirect('/campgrounds');
});

app.listen(3000, () => {
	console.log(`Serving on pport 3000`);
});
