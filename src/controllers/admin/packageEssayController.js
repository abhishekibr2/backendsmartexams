const PackageEssay = require('../../models/packageEssay');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const package = require('../../models/packageModel');

const packageEssayController = {
    getAllPackageEssay: async (req, res) => {
        try {
            const { packageId, id, orderBy } = req.body;

            const filter = { status: 'active' };
            if (packageId) filter.packageId = packageId;
            if (id) filter.packageId = id;

            const order = orderBy === "newest" ? -1 : 1;

            const packageEssays = await PackageEssay.find(filter)
                .sort({ createdAt: order })
                .populate('packageId', 'packageName');

            res.status(200).json({ status: true, data: packageEssays });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addUpdatePackageEssayDetails: async (req, res) => {
        try {
            const { packageId, essayName, createdBy, updateId } = req.body;

            const essayEntries = essayName
                .split('\n')
                .map(entry => entry.trim())
                .filter(entry => entry);

            const extractedData = essayEntries.map(entry => {
                const parts = entry.split('|').map(part => part.trim());
                const essayName = (parts[0] && parts[0].slice(0, 120)) || '';
                const essayType = (parts[1] && parts[1].slice(0, 60)) || '';
                const duration = parts[2] || '';

                return {
                    essayName,
                    essayType,
                    duration,
                };
            });

            const totalEssays = extractedData.length;

            let existingEssayNames = [];

            for (let i = 0; i < totalEssays; i++) {
                const essayData = extractedData[i];

                const EssayData = {
                    packageId: packageId,
                    essayName: essayData.essayName,
                    essayType: essayData.essayType,
                    duration: essayData.duration,
                    addedTotalEssay: totalEssays,
                };

                try {
                    // Correct duplicate check logic
                    const duplicateCheckQuery = updateId
                        ? { packageId: packageId, essayName: essayData.essayName, _id: { $ne: updateId } }
                        : { packageId: packageId, essayName: essayData.essayName };

                    const duplicateEssayName = await PackageEssay.findOne(duplicateCheckQuery);

                    if (duplicateEssayName) {
                        existingEssayNames.push(essayData.essayName);
                        continue; // Skip saving this entry if duplicate
                    }

                    const packageData = await package.findOne({ _id: packageId });
                    if (!packageData) {
                        return res.status(404).json({ status: false, message: 'Package not found' });
                    }

                    let essayEntry;
                    if (updateId) {
                        essayEntry = await PackageEssay.findById(updateId);
                        if (!essayEntry) {
                            return res.status(404).json({ status: false, message: 'Essay not found for update' });
                        }

                        // Update existing entry
                        essayEntry.packageId = packageId;
                        essayEntry.essayName = EssayData.essayName;
                        essayEntry.essayType = EssayData.essayType;
                        essayEntry.duration = EssayData.duration;
                        essayEntry.addedTotalEssay = totalEssays;
                        essayEntry.updatedBy = createdBy || null;

                        await essayEntry.save();
                    } else {
                        // Create new entry
                        essayEntry = new PackageEssay({
                            ...EssayData,
                            createdBy: createdBy || null,
                        });

                        await essayEntry.save();
                    }

                    if (!packageData.hasEssay) {
                        packageData.hasEssay = 'yes';
                        await packageData.save();
                    }
                } catch (error) {
                    console.error('Error processing Essay:', error);
                    return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
                }
            }

            if (existingEssayNames.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'The following essay names already exist in the same package:',
                    existingEssays: existingEssayNames,
                });
            }

            return res.status(200).json({ status: true, message: 'Essays processed successfully' });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },





    deletePackageEssay: async (req, res) => {
        try {
            const ids = Array.isArray(req.body) ? req.body.flat() : [];
            if (!ids.length) {
                return res.status(400).json({ status: false, message: 'No IDs provided for deletion' });
            }

            const invalidIds = ids.filter((id) => !isValidObjectId(id));
            if (invalidIds.length) {
                return res.status(400).json({ status: false, message: `Invalid IDs: ${invalidIds.join(', ')}` });
            }

            const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
            await PackageEssay.deleteMany({ _id: { $in: objectIdArray } });

            res.status(200).json({ status: true, message: 'Essay deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = packageEssayController;
