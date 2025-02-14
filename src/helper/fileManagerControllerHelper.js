const FavoriteFiles = require('../models/favoritesFiles');
const convertSize = require('./convertFileSize');

const getQuery = (search, isPublic) => {
	let query = { status: 'active' };

	if (search) {
		try {
			const searchParams = JSON.parse(search);

			if (isPublic === "false") {
				query.createdBy = searchParams.userId;
				if (searchParams.folderId) {
					query.folderId = searchParams.folderId;
				}
			}
		} catch (e) {
			throw new Error('Invalid search parameters');
		}
	}

	return query;
};


const getSortOption = (search) => {
	let sortOption = { createdAt: -1 };

	if (search) {
		try {
			const searchParams = JSON.parse(search);

			if (searchParams.sorting === 'alphaBetically') {
				sortOption = { fileName: 1 };
			}
		} catch (e) {
			throw new Error('Invalid search parameters');
		}
	}

	return sortOption;
};

const getPaginationOptions = (page, pageSize, sortOption) => {
	return {
		skip: (page - 1) * pageSize,
		limit: parseInt(pageSize, 10),
		sort: sortOption
	};
};

const getFavoriteFiles = async (isPublic, files) => {
	if (isPublic) {
		return await FavoriteFiles.find();
	} else {
		const userIds = files.map((file) => file.createdBy._id);
		return await FavoriteFiles.find({ userId: { $in: userIds } });
	}
};

const formatFiles = (files, favoriteFiles, isPublic) => {
	const favoriteFilesMap = new Map();
	favoriteFiles.forEach((favFile) => {
		favoriteFilesMap.set(favFile.userId.toString(), favFile.files);
	});

	return files.map((file) => {
		const formattedFile = file.toObject();
		formattedFile.fileSize = convertSize(formattedFile.fileSize);

		if (!isPublic) {
			const userFavorites = favoriteFilesMap.get(file.createdBy._id.toString());
			formattedFile.isFavorite = userFavorites ? userFavorites.includes(formattedFile._id) : false;
		} else {
			formattedFile.isFavorite = favoriteFiles.some((fav) => fav.files.includes(formattedFile._id));
		}

		return formattedFile;
	});
};

module.exports = { getQuery, getSortOption, getPaginationOptions, getFavoriteFiles, formatFiles };
