// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const { ZOOM_CLIENT_ID, ZOOM_SECRET_ID } = require('../config/envConfig');

class Zoom {
	constructor() {
		this.apiKey = ZOOM_CLIENT_ID;
		this.apiSecret = ZOOM_SECRET_ID;
		this.baseUrl = 'https://api.zoom.us/v2';
	}

	async generateAccessToken() {
		try {
			const response = await axios.post(
				`https://zoom.us/oauth/token`,
				{
					grant_type: 'account_credentials',
					account_id: 'Ixt2K9r4QoOOldcZiG2ntQ'
				},
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: 'Basic YW1sbjJDV1I0bTRvbFNGMkN3UDNBOmF4cnFJRm1CbUtkd1BmRGJvbjBtbGk2RTM1Nkg2dFh3'
					}
				}
			);

			return response.data.access_token;
		} catch (error) {
			console.error('Error getting access token:', error.response ? error.response.data : error.message);
			throw new Error('Failed to generate access token');
		}
	}

	async createMeeting(data) {
		try {
			const formattedDate = data.startDate;
			const payload = {
				topic: data.title,
				type: 2,
				start_time: formattedDate,
				duration: 60,
				timezone: 'UTC'
			};
			const response = await axios.post(`${this.baseUrl}/users/me/meetings`, payload, {
				headers: {
					Authorization: `Bearer ${await this.generateAccessToken()}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			console.error('Error creating meeting:', error);
			throw new Error(error.response ? error.response.data : 'Internal Server Error');
		}
	}

	async updateMeeting(meetingId, topic, startTime, duration) {
		try {
			const response = await axios.patch(
				`${this.baseUrl}/meetings/${meetingId}`,
				{
					topic,
					start_time: startTime,
					duration
				},
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}.${this.apiSecret}`,
						'Content-Type': 'application/json'
					}
				}
			);
			return response.data;
		} catch (error) {
			throw new Error(error.response ? error.response.data : 'Internal Server Error');
		}
	}

	async getAllMeetings() {
		try {
			const response = await axios.get(`${this.baseUrl}/users/me/meetings`, {
				headers: {
					Authorization: `Bearer ${await this.generateAccessToken()}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(error.response ? error.response.data : 'Internal Server Error');
		}
	}

	async getSingleMeeting(meetingId) {
		try {
			const response = await axios.get(`${this.baseUrl}/meetings/${meetingId}`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}.${this.apiSecret}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(error.response ? error.response.data : 'Internal Server Error');
		}
	}

	async deleteMeeting(meetingId) {
		try {
			const response = await axios.delete(`${this.baseUrl}/meetings/${meetingId}`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}.${this.apiSecret}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(error.response ? error.response.data : 'Internal Server Error');
		}
	}
}

module.exports = Zoom;
