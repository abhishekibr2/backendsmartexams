const packageType = require('../../models/packageType');

const packageTypeController = {
    addPackageType: async (req, res) => {
        try {
            const { selectedPackage, updateId } = req.body.data;

            const existingPackage = await packageType.findOne({ selectedPackage });

            if (existingPackage && existingPackage._id.toString() !== updateId) {
                return res.status(400).json({ error: "Package Type name must be unique" });
            }

            if (updateId) {
                const updatedPackageType = await packageType.findOneAndUpdate(
                    { _id: updateId },
                    { selectedPackage },
                    { new: true }
                );

                if (!updatedPackageType) {
                    return res.status(404).json({ error: "Package Type not found" });
                }

                return res.status(200).json({ message: "Package Type updated successfully" });
            } else {
                const newPackageType = new packageType({
                    selectedPackage,
                    isActive: true,
                });

                await newPackageType.save();

                return res.status(201).json({ message: "Package Type added successfully" });
            }
        } catch (error) {
            console.error("Error adding or updating package type:", error);
            return res.status(500).json({ error: "Failed to add or update package type" });
        }
    },




    getPackageType: async (req, res) => {
        try {
            const packageTypes = await packageType.find();
            res.status(200).json({ packageTypes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to get Package Types" });
        }
    },

    deletePackageTye: async (req, res) => {

        console.log(req.body, 'hello')
        try {
            const { packageId } = req.body.data;
            const deletedPackageType = await packageType.findByIdAndDelete(packageId);

            if (!deletedPackageType) {
                return res.status(404).json({ error: "Package Type not found" });
            }

            return res.status(200).json({ message: "Package Type deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to delete Package Type" });
        }
    }
}

module.exports = packageTypeController;
