const natural = require('natural');
const classifier = new natural.BayesClassifier();
const dataset = require('./spamDataset.json');

for (const label in dataset) {
	if (Object.hasOwnProperty.call(dataset, label)) {
		const examples = dataset[String(label)];
		examples.forEach((example) => {
			classifier.addDocument(example, label);
		});
	}
}

// Train the classifier
classifier.train();

// Save the trained classifier to a file
classifier.save('spamClassifier.json', function (err) {
	if (err) {
		console.error('Error saving the classifier:', err);
	} else {
		console.log('Classifier trained and saved successfully.');
	}
});
