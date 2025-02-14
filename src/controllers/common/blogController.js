const Blog = require('../../models/Blog');
const BlogViewCount = require('../../models/BlogViewCount');
const errorLogger = require('../../../logger');
// eslint-disable-next-line import/no-extraneous-dependencies
const fetch = require('node-fetch');

const blogController = {
	allBlogs: async (req, res) => {
		try {
			const activeAndLatestBlogs = await Blog.find({ status: 'active' })
				.sort({ createdAt: -1 })
				.populate('authorId');

			res.status(200).json({ status: true, data: activeAndLatestBlogs });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	singleBlog: async (req, res) => {
		try {
			const slug = req.params.slug;

			const singleBlog = await Blog.findOne({ slug: slug }).populate('authorId');

			let blogView = 0;

			if (singleBlog) {
				blogView = await BlogViewCount.countDocuments({ blogId: singleBlog._id });
			}

			if (!singleBlog) {
				return res.status(404).json({ status: false, message: 'Blog not found' });
			}
			res.status(200).json({ status: true, data: singleBlog, blogView: blogView });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	blogViews: async (req, res) => {
		try {
			const {
				blogId,
				country,
				countryCode,
				regionName,
				city,
				zip,
				lat,
				lon,
				timezone,
				isp,
				query,
				browserName,
				operatingSystem,
				deviceName
			} = req.body;

			await BlogViewCount.create({
				blogId: blogId,
				country: country,
				countryCode: countryCode,
				regionName: regionName,
				city: city,
				zip: zip,
				lat: lat,
				lon: lon,
				timezone: timezone,
				isp: isp,
				ipAddress: query,
				operatingSystem: operatingSystem,
				browserName: browserName,
				deviceName: deviceName
			});

			res.status(200).json({ status: true, message: 'View count recorded successfully' });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	fetchViewsBlogData: async (req, res) => {
		try {
			const response = await fetch(
				'http://ip-api.com/json?fields=status,message,country,district,countryCode,region,regionName,city,zip,lat,lon,timezone,currency,isp,org,as,query'
			);
			if (!response.ok) {
				throw new Error('Failed to fetch data from ip-api');
			}
			const data = await response.json();
			res.json(data);
		} catch (error) {
			console.error('Error in proxy:', error);
			res.status(500).json({ error: 'Unable to fetch data from external API.' });
		}
	}
};

module.exports = blogController;
