const asyncHandler = require('express-async-handler');
const Zoom = require('../../services/Zoom');

const zoomController = {
	create: asyncHandler(async (req, res) => {
		const zoom = new Zoom();
		const newMeeting = await zoom.createMeeting(req.body);
		res.status(201).json(newMeeting);
	})
};

module.exports = zoomController;
