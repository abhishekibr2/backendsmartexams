'use strict';
const fs = require('fs');
const natural = require('natural');
const ContactUs = require('../../models/ContactUs');
const logError = require('../../../logger');

// Load the serialized classifier
let classifier;
try {
	const classifierData = fs.readFileSync('./src/spamDetect/spamClassifier.json', 'utf-8');
	classifier = natural.BayesClassifier.restore(JSON.parse(classifierData));
} catch (error) {
	console.error('Error loading the classifier:', error);
}

const contactController = {
	submitContactUs: async (req, res) => {
		try {
			const { name, email, message, address, number } = req.body;

			// Check if classifier is loaded
			if (!classifier) {
				console.error('Classifier is not loaded.');
				res.status(500).json({ message: 'Internal Server Error' });
				return;
			}
			// const classification = classifier.classify(message);
			// if (classification === 'spam') {
			// 	res.status(400).json({ message: 'Spam detected', status: false });
			// 	return;
			// }
			const newSubmission = new ContactUs({
				name,
				email,
				message,
				address,
				number
			});

			await newSubmission.save();

			res.status(201).json({ message: 'Contact form submitted successfully', status: true });
		} catch (error) {
			logError(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = contactController;
