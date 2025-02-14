const Package = require('../../models/packageModel');
const PublishPackageData = require('../../models/PublishPackage');
const multer = require('multer');
const tests = require('../../models/test')
const PackageEssay = require('../../models/packageEssay');
const mongoose = require('mongoose');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const catchErrors = require('../../middleware/catchErrors');

const packageController = {
    addPackagesDetails: async (req, res) => {
        try {
            const upload = createUpload('packageImage');
            upload.single('packageImage')(req, res, async (err) => {
                if (err) return res.status(500).json({ message: 'Error uploading file', status: false });

                const {
                    packageName,
                    packageDescription,
                    packagePrice,
                    adminComment,
                    discountApplied,
                    packageDuration,
                    state,
                    grade,
                    examType,
                    numSubjects,
                    subjectsInPackage,  // This is the string of comma-separated ObjectIds
                    testType,
                    qualityChecked,
                    numTests,
                    isFree,
                    isPublished,
                    isActive,
                    numUniqueSubjects,
                    assignedTo,
                    packageStatus,
                    testConductedBy,
                    hasEssay,
                    hasPackage,
                    packageType,
                    essayTypes,
                    packageId,
                    packageDiscount
                } = req.body;

                // Convert subjectsInPackage string to an array of ObjectIds
                const subjectsInPackageArray = subjectsInPackage.split(',').map(subjectId => new mongoose.Types.ObjectId(subjectId.trim()));

                // Calculate the discount price
                const price = parseFloat(packagePrice); // Ensure the price is a number
                const discount = parseFloat(packageDiscount); // Ensure the discount is a number

                let packageDiscountPrice = null;
                if (!isNaN(price) && !isNaN(discount) && discount > 0) {
                    packageDiscountPrice = price - (price * (discount / 100));
                }

                // Prepare the package data
                const packageData = {
                    packageName,
                    packageDescription,
                    packagePrice,
                    packageDiscount,
                    adminComment,
                    discountApplied,
                    packageDuration,
                    state,
                    grade,
                    examType,
                    numSubjects,
                    subjectsInPackage: subjectsInPackageArray,  // Use the array of ObjectIds here
                    testType,
                    qualityChecked,
                    numTests,
                    isFree,
                    isPublished,
                    isActive,
                    numUniqueSubjects,
                    assignedTo,
                    packageStatus,
                    testConductedBy,
                    hasEssay,
                    hasPackage,
                    packageType,
                    essayTypes,
                    packageImage: req.file ? req.file.filename : null,
                    createdBy: req.user._id,
                    packageDiscountPrice: packageDiscountPrice
                };

                // Validate if the package name is unique (excluding the current package if updating)
                const duplicateCheckQuery = packageId
                    ? { packageName, _id: { $ne: packageId } }
                    : { packageName };

                const existingPackageName = await Package.find(duplicateCheckQuery);
                if (existingPackageName.length > 0) {
                    return res.status(400).json({ message: 'Package name already exists' });
                }

                // Validate if the combination of packageName and packagePrice is unique
                const uniqueNamePriceQuery = packageId
                    ? { packageName, packagePrice, _id: { $ne: packageId } }
                    : { packageName, packagePrice };

                const existingNamePriceCombination = await Package.find(uniqueNamePriceQuery);
                if (existingNamePriceCombination.length > 0) {
                    return res.status(400).json({
                        message: 'A package with the same name and price already exists'
                    });
                }

                let packageResult;
                if (packageId) {
                    // Update existing package
                    packageResult = await Package.findByIdAndUpdate(packageId, packageData, { new: true });
                    if (!packageResult) return res.status(404).json({ message: 'Package not found' });

                    return res.status(200).json({
                        status: true,
                        message: 'Package updated successfully',
                        package: packageResult
                    });
                } else {
                    // Add new package
                    packageResult = await new Package(packageData).save();
                    return res.status(201).json({
                        status: true,
                        message: 'Package added successfully',
                        package: packageResult
                    });
                }
            });
        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getAllPackages: async (req, res) => {
        try {
            let { limit = 10, page = 1, orderBy = 'newest', ...query } = req.query;
            const order = orderBy === "newest" ? -1 : 1;
            Object.keys(query).forEach((key) => {
                // eslint-disable-next-line security/detect-object-injection
                if (query[key] === '' || query[key] === null || query[key] === undefined) {
                    // eslint-disable-next-line security/detect-object-injection
                    delete query[key];
                }
            });
            if (query.packageName) {
                query.packageName = { $regex: new RegExp(query.packageName, 'i') }; // 'i' makes it case-insensitive
            }
            const packages = await Package
                .find(query)
                .sort({ createdAt: order })
                .populate('state testConductedBy subjectsInPackage examType packageType packageDuration')
                .populate('grade', 'gradeLevel')
                .limit(limit)
                .skip((page - 1) * limit);
            const totalPackage = await Package.countDocuments()
            res.status(200).json({ status: true, data: packages, totalPackage });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getTestsOfpackages: async (req, res) => {
        const { id } = req.params;
        res.status(200).json(id)
    },

    deletePackage: async (req, res) => {
        try {
            const packageIds = req.body.data;

            if (!packageIds || packageIds.length !== 1) {
                return res.status(400).json({ status: false, message: 'Package ID is required' });
            }

            const packageId = new mongoose.Types.ObjectId(packageIds[0]);
            const isAssignedInTest = await tests.find({ packageName: { $in: packageIds } });

            if (isAssignedInTest.length) {
                return res.status(400).json({
                    status: false,
                    message: 'Package cannot be deleted as it is assigned to a Test',
                });
            }
            const deletedPackage = await Package.findByIdAndDelete(packageId);

            if (!deletedPackage) {
                return res.status(404).json({ status: false, message: 'Package not found' });
            }

            await tests.updateMany(
                { packageName: packageId },
                { $unset: { packageName: "" } }
            );

            await PublishPackageData.updateMany(
                { packageName: packageId },
                { $set: { status: "deleted" } }
            );

            return res.status(200).json({
                status: true,
                message: `Package deleted successfully.`
            });

        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    publishPackage: async (req, res) => {
        const upload = createUpload('publishPackage');
        const uploadMiddleware = upload.array('packageImage', 10);

        uploadMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'Multer error occurred', error: err.message, status: false });
            } else if (err) {
                return res.status(400).json({ message: 'Error uploading files', error: err.message, status: false });
            }

            try {
                const { id, packageId, stateId, price, discount, examTypeId, description, durationId, existingImages } = req.body;
                const packageImages = [
                    ...(existingImages ? JSON.parse(existingImages) : []),
                    ...(req.files.map((file) => ({
                        path: file.path,
                        filename: file.filename,
                    }))),
                ];

                let response;

                if (id) {
                    response = await PublishPackageData.findByIdAndUpdate(
                        id,
                        {
                            packageId,
                            stateId,
                            price,
                            discount,
                            examTypeId,
                            packageImage: packageImages,
                            description,
                            durationId,
                        },
                        { new: true }
                    );

                    if (!response) {
                        return res.status(404).json({
                            message: 'Package not found for updating',
                            status: false,
                        });
                    }

                    return res.status(200).json({
                        message: 'Package updated successfully',
                        data: response,
                        status: true,
                    });
                } else {
                    const publishNewPackage = new PublishPackageData({
                        packageId,
                        stateId,
                        price,
                        discount,
                        examTypeId,
                        packageImage: packageImages,
                        description,
                        durationId,
                    });

                    response = await publishNewPackage.save();

                    return res.status(200).json({
                        message: 'Package published successfully',
                        data: response,
                        status: true,
                    });
                }
            } catch (error) {
                errorLogger(error);
                return res.status(500).json({ message: 'Internal server error', error: error.message, status: false });
            }
        });
    },

    updatePublishPackage: catchErrors(async (req, res) => {
        const { id, value } = req.body;
        const packageData = await Package.findById(id).populate({
            path: 'tests',
            populate: { path: 'questions', model: 'Question' }
        });

        if (!packageData) {
            return res.status(404).json({ message: 'Package not found' });
        }

        if (!packageData.qualityChecked) {
            return res.status(400).json({ message: 'Quality check is incomplete' });
        }

        if (packageData.tests.length !== packageData.numTests) {
            return res.status(400).json({ message: 'All tests are not added' });
        }

        const incompleteTest = packageData.tests.find(test => !test.qualityChecked || !test.isPublished);
        if (incompleteTest) {
            return res.status(400).json({ message: 'Some tests are either not quality checked or not published' });
        }

        packageData.isPublished = value;
        await packageData.save();

        return res.status(200).json({ message: 'Package publish status updated', id, value, package: packageData });
    }),

    updateQualityChecked: catchErrors(async (req, res) => {
        const { id, value } = req.body;
        const package = await Package.findById(id);

        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        package.qualityChecked = value;
        if (!value) {
            package.isPublished = value;
        }
        await package.save();

        return res.status(200).json({ id, value, package });
    }),

    getSinglePackageInfo: async (req, res) => {
        try {
            const packageId = req.params.packageId;

            if (packageId) {
                const query = {
                    $or: [
                        { _id: packageId },
                        { packageId: new mongoose.Types.ObjectId(packageId) }
                    ]
                };
                const packageData = await Package.findOne(query).populate('state testConductedBy subjectsInPackage examType packageType packageDuration')
                const essayData = await PackageEssay.findOne({ packageId: packageId });
                const publish = await PublishPackageData.findOne({ packageId: packageId });
                if (essayData) {
                    packageData.hasEssay = 'yes';
                    await packageData.save();
                }
                if (!packageData) {
                    return res.status(404).json({ status: false, message: 'Package not found' });
                }
                return res.status(200).json({ status: true, data: packageData, publishData: publish });
            }
            const allPackages = await Package.find();
            return res.status(200).json({ status: true, data: allPackages });

        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    AssignPackages: async (req, res) => {
        try {
            const { packageId, testId } = req.body;

            if (!testId) {
                return res.status(400).json({ status: false, message: 'Test ID is required' });
            }

            if (Array.isArray(packageId) && packageId.length > 0) {
                const packagesToUpdate = await Package.find({ _id: { $in: packageId } });

                if (packagesToUpdate.length === 0) {
                    return res.status(404).json({ status: false, message: 'Packages not found' });
                }

                const allPackages = await Package.find({ 'tests': testId });

                for (let pkg of allPackages) {
                    if (!packageId.includes(pkg._id.toString())) {
                        pkg.tests = pkg.tests.filter(test => test.toString() !== testId);
                        await pkg.save();
                    }
                }

                let existingTestIds = [];
                packagesToUpdate.forEach(pkg => {
                    pkg.tests.forEach(test => {
                        existingTestIds.push(test.toString());
                    });
                });

                if (existingTestIds.includes(testId.toString())) {
                    return res.status(400).json({
                        status: false,
                        message: `Test is already assigned to one or more selected packages`
                    });
                }

                for (let pkg of packagesToUpdate) {
                    if (!pkg.tests.includes(testId)) {
                        pkg.tests.push(testId);
                        await pkg.save();
                    }
                }

                return res.status(200).json({
                    status: true,
                    message: `Test assigned successfully to the selected packages`,
                    data: packagesToUpdate
                });
            }

            if (Array.isArray(packageId) && packageId.length === 0) {
                const packagesToUpdate = await Package.find({ 'tests': testId });

                if (packagesToUpdate.length === 0) {
                    return res.status(404).json({ status: false, message: 'No packages found with the given Test ID' });
                }

                for (let pkg of packagesToUpdate) {
                    pkg.tests = pkg.tests.filter(test => test.toString() !== testId);
                    await pkg.save();
                }

                return res.status(200).json({
                    status: true,
                    message: `Test has been removed from the package`,
                    data: packagesToUpdate
                });
            }

            return res.status(400).json({ status: false, message: 'Invalid request data' });
        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    testInPackage: async (req, res) => {
        try {
            const testid = req.body.testid;
            const packageData = await Package
                .findOne({ _id: testid })
                .populate('state testConductedBy')
                .populate({
                    path: 'tests',
                    populate: 'state testConductedBy'
                });
            const essayData = await tests.find({ createTestId: testid }).populate('testConductedBy state');
            if (packageData) {
                return res.status(200).json({
                    status: true,
                    essayData: essayData,
                    packageData: packageData
                });
            } else {
                return res.status(404).json({ status: false, message: 'Package with the provided testId not found.' });
            }

        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    saveFeature: catchErrors(async (req, res) => {
        const packageId = req.params.packageId;
        let { features, tag, packageColor, packagePrice, compareAtPrice } = req.body;

        if (Array.isArray(features)) {
            features = features.filter(feature => feature.featureName.trim() && feature.availability.trim());
        }

        const updateData = {
            tag,
            packageColor,
            packagePrice,
            compareAtPrice
        };

        if (features.length > 0) {
            updateData.$push = { features: { $each: features } };
        }

        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            updateData,
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: "Package not found" });
        }

        res.status(200).json({
            message: "Package updated successfully",
            data: updatedPackage
        });
    }),

    UpdateFeature: catchErrors(async (req, res) => {
        const { packageId, featureId } = req.params;
        const { availability } = req.body;

        const updatedPackage = await Package.findOneAndUpdate(
            { _id: packageId, "features._id": featureId },
            { $set: { "features.$.availability": availability } },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({
                message: "Package or feature not found"
            });
        }

        res.status(200).json({
            message: "Feature updated successfully",
            data: updatedPackage
        });
    }),

    deleteFeature: catchErrors(async (req, res) => {
        const { packageId, featureId } = req.params;

        // Find the package by ID and remove the feature
        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            { $pull: { features: { _id: featureId } } },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        res.status(200).json({
            message: "Feature removed successfully",
            data: updatedPackage
        });
    }),

    packageTest: catchErrors(async (req, res) => {
        const { packageId } = req.query
        const package = await Package.findById(packageId).populate('assignTest.testId').populate('tests')
        // .find({
        //     _id: packageId,
        //     assignTest: { $elemMatch: { testId: testId } }
        // })
        res.status(200).json(package)
    }),

    availablePackage: catchErrors(async (req, res) => {
        try {
            const packages = await Package.find({
                $expr: { $lt: [{ $size: "$tests" }, "$numTests"] }
            }).populate('packageType packageDuration state grade examType subjectsInPackage tests');

            res.status(200).json({ status: true, data: packages });
        } catch (error) {
            console.error('Error fetching packages:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    })
}

module.exports = packageController;
