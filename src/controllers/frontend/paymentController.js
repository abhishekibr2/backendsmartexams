const eBookPayment = require('../../models/eBookPayment');
const ProductCheckout = require('../../models/ProductCheckout');
const AdminSettings = require('../../models/adminSettings');
const Cart = require('../../models/Cart');
const errorLogger = require('../../../logger');
const { sendEmailOrderSummary } = require('../../services/auth');



const paymentController = {
	getAllPayments: async (req, res) => {
		try {
			const payments = await eBookPayment.find().sort({ _id: -1 });
			res.status(200).json({ status: true, data: payments });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ error: 'Error fetching payments' });
		}
	},

	getClientSecret: async (req, res) => {
		try {
			let { totalAmount } = req.body;

			if (!totalAmount || isNaN(totalAmount)) {
				return res.status(400).json({ status: false, error: 'Invalid total amount' });
			}

			totalAmount = Math.round(parseFloat(totalAmount) * 100);

			const adminSettings = await AdminSettings.findOne().select('payment');
			if (!adminSettings || !adminSettings.payment) {
				return res.status(500).json({ status: false, error: 'Payment settings not configured' });
			}

			let stripeKey;
			if (adminSettings.payment.paymentMode === 'test') {
				stripeKey = adminSettings.payment.stripeTestKey;
			} else {
				stripeKey = adminSettings.payment.stripeLiveKey;
			}

			if (!stripeKey) {
				return res.status(500).json({
					status: false,
					error: `Stripe ${adminSettings.payment.paymentMode} key is not configured`,
				});
			}

			const Stripe = require('stripe')(stripeKey);

			const paymentIntent = await Stripe.paymentIntents.create({
				amount: totalAmount,
				currency: 'usd',
			});

			// Return the clientSecret from the PaymentIntent
			res.status(200).json({ status: true, data: paymentIntent.client_secret });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, error: 'Error fetching client secret' });
		}
	},

	confirmProductCheckout: async (req, res) => {
		try {
			const { userId, formData, cartItem, stripeDetails } = req.body;

			// Validate userId and cartItem existence
			if (!userId || !cartItem) {
				return res.status(400).json({ error: "Invalid or missing data." });
			}

			// Check if the package is free
			const isFreePackage =
				cartItem.cart.package.length > 0 && Number(cartItem.totalAmount) === 0;

			// Validate stripeDetails only if not a free package
			if (!isFreePackage && (!stripeDetails || !stripeDetails.paymentIntentId)) {
				return res.status(400).json({ error: "Stripe details are required for payment." });
			}

			// Helper functions for parsing package and eBook data
			const mapPackageDetails = (packages) =>
				packages.map((pkg) => {
					const durationTime = pkg.packageId.packageDuration.DurationTime || null;
					let calculatedTime = null;

					if (durationTime) {
						const [value, unit] = durationTime.split(" ");
						const currentDate = new Date();

						// Handling for Month
						if (unit.toLowerCase().includes("month")) {
							currentDate.setMonth(currentDate.getMonth() + parseInt(value, 10));
						}
						// Handling for Year
						else if (unit.toLowerCase().includes("year")) {
							currentDate.setFullYear(currentDate.getFullYear() + parseInt(value, 10));
						}
						// Handling for Day
						else if (unit.toLowerCase().includes("day")) {
							currentDate.setDate(currentDate.getDate() + parseInt(value, 10));
						}
						// Handling for Week
						else if (unit.toLowerCase().includes("week")) {
							currentDate.setDate(currentDate.getDate() + parseInt(value, 10) * 7); // 1 week = 7 days
						}

						calculatedTime = currentDate.toISOString(); // Future date based on DurationTime
					}

					return {
						packageId: pkg.packageId._id || null,
						packageName: pkg.packageId.packageName || "Unknown Package",
						packagePrice: parseFloat(pkg.packageId.packagePrice) || 0,
						packageQuantity: parseInt(pkg.quantity, 10) || 1,
						packageDiscount: parseFloat(pkg.packageId.packageDiscount) || 0,
						packageDiscountPrice: parseFloat(pkg.packageId.packageDiscountPrice) || 0,
						packageValidity: {
							durationTime,
							calculatedTime, // Store calculated future date
						},
					};
				});

			const mapEBookDetails = (eBooks) =>
				eBooks.map((ebook) => ({
					eBookId: ebook.eBookId._id || null,
					eBookTitle: ebook.eBookId.title || "Unknown eBook",
					eBookPrice: parseFloat(ebook.eBookId.price) || 0,
					eBookQuantity: parseInt(ebook.quantity, 10) || 1,
					eBookDiscount: parseFloat(ebook.eBookId.discount) || 0,
					eBookDiscountPrice: parseFloat(ebook.eBookId.discountedPrice) || 0,
				}));

			// Construct order summary
			const orderSummary = {
				package: mapPackageDetails(cartItem.cart.package || []),
				eBook: mapEBookDetails(cartItem.cart.eBook || []),
				coupon: {
					isCouponApplied: cartItem.cart.coupon.isCouponApplied || false,
					couponCode: cartItem.cart.coupon.couponCode || "",
					discountPercentage: cartItem.cart.coupon.discountPercentage || 0,
					totalCouponDiscount: cartItem.packageDetails.couponDiscount || 0,
				},
				subTotal: parseFloat(cartItem.subTotal) || 0,
				totalAmount: parseFloat(cartItem.totalAmount) || 0,
				paymentMethod: isFreePackage ? "Free" : stripeDetails.paymentMethod || "Unknown",
				paymentStatus: isFreePackage
					? "completed"
					: stripeDetails.transactionStatus === "succeeded"
						? "completed"
						: "pending",
			};

			// Construct checkout data
			const checkoutData = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				country: formData.country,
				streetAddress1: formData.streetAddress1,
				streetAddress2: formData.streetAddress2,
				townCity: formData.townCity,
				state: formData.state,
				zipCode: formData.zipCode,
				phone: formData.phone,
				email: formData.email,
				terms: formData.terms,
				userId,
				orderSummary,
				paymentIntentId: stripeDetails.paymentIntentId || null,
				clientSecret: stripeDetails.clientSecret || null,
				paymentMethodId: stripeDetails.paymentMethodId || null,
				currency: stripeDetails.currency || "USD",
				transactionStatus: stripeDetails.transactionStatus || "requires_payment_method",
				status: "completed",
			};

			// Save checkout data
			const productCheckout = new ProductCheckout(checkoutData);
			const savedCheckout = await productCheckout.save();


			// Remove user cart items
			if (cartItem.cart._id) {
				await Cart.findByIdAndDelete(cartItem.cart._id);
			}

			const emailData = {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				phoneNumber: formData.phone,
			};

			const emailPlaceholders = {
				OrderSummary: orderSummary,
			};
			await sendEmailOrderSummary(emailData, "order_confirmation", emailPlaceholders);

			// const adminEmail = await Users.findOne({ role: "admin" });
			// console.log(adminEmail)
			// const adminEmailData = {
			// 	name: adminEmail.name,
			// 	email: adminEmail.email,
			// }
			// await sendEmailOrderSummary(adminEmailData, "order_confirmation", emailPlaceholders, emailData);

			res.status(201).json({
				status: true,
				message: "Package checkout details saved successfully.",
				data: savedCheckout,
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ error: "Error processing package checkout." });
		}
	},

	getUserOrderDetails: async (req, res) => {
		try {
			const { userId } = req.params;
			const userOrders = await ProductCheckout.findOne({ userId }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: userOrders });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ error: 'Error fetching user order details.' });
		}
	}

};

module.exports = paymentController;
