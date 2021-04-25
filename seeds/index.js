const mongoose = require('mongoose');
const { cities } = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

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

// sample

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
