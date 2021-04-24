const express = require('express');
const path = require('path');
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
// setup ejs and path to views dir
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// routes
app.get('/', (req, res) => {
	res.render('home');
});
app.get('/campground', async (req, res) => {
	const camp = new Campground({
		title: 'Backyard',
		description: 'Cheap camping',
	});
	await camp.save();
	res.send(camp);
});

app.listen(3000, () => {
	console.log(`Serving on pport 3000`);
});
