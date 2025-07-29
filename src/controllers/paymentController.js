const paymentService = require('../services/paymentService');
const { ERROR_MESSAGES } = require('../config/constants');
const jwtUtils = require('../utils/jwtUtils');
const response = require('../utils/response');
const pool = require('../config/database');

// Initialize Stripe only if secret key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const paymentController = {
    // Create payment intent
    createPaymentIntent: async (req, res) => {
        try {
            const { shop_id, code_id, quantity = 1, id, payment_ip } = req.body;
            
            // Validate required fields
            if (!shop_id || !code_id || !id) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Shop ID, Code ID and ID are required',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            // Token verification handled by middleware
            // User info available in req.user

            // Create payment intent
            const paymentData = await paymentService.createPaymentIntent(shop_id, code_id, quantity, id, payment_ip);
            
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'Payment intent created successfully',
                data: {
                    clientSecret: paymentData.clientSecret,
                    paymentIntentId: paymentData.paymentIntentId,
                    amount: paymentData.amount,
                    amountInCents: true,
                    currency: 'USD',
                    shopItems: paymentData.shopItems
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error creating payment intent:', error);
            
            if (error.message === 'Shop items not found') {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    message: 'Shop items not found',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failed to create payment intent',
                errors: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Verify payment
    verifyPayment: async (req, res) => {
        try {
            const { paymentIntentId } = req.body;
            
            if (!paymentIntentId) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Payment Intent ID is required',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            // Token verification handled by middleware
            // User info available in req.user

            // Verify payment with Stripe
            const paymentIntent = await paymentService.verifyPayment(paymentIntentId);
            
            if (paymentIntent.status === 'succeeded') {
                // Update payment record in database
                await paymentService.updatePaymentRecordAfterVerification(paymentIntent);

                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    message: 'Payment verified successfully',
                    data: {
                        paymentStatus: paymentIntent.status,
                        amount: paymentIntent.amount / 100,
                        amountInCents: false,
                        currency: 'USD',
                        shopItems: paymentIntent.metadata.shop_ids ? paymentIntent.metadata.shop_ids.split(',').map((id, index) => ({
                            id: parseInt(id),
                            name: paymentIntent.metadata.shop_names.split(',')[index],
                            key: paymentIntent.metadata.shop_keys.split(',')[index]
                        })) : []
                    },
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Payment not completed',
                    data: {
                        paymentStatus: paymentIntent.status
                    },
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failed to verify payment',
                errors: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Webhook handler for Stripe events
    handleWebhook: async (req, res) => {
        if (!stripe) {
            return res.status(500).json({
                status: false,
                message: 'Stripe is not configured'
            });
        }

        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                
                // Update payment record and store purchased items
                try {
                    await paymentService.updatePaymentRecordAfterVerification(paymentIntent);
                    console.log('Payment recorded and shop items stored in database');
                } catch (error) {
                    console.error('Error recording payment from webhook:', error);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    },

    // Get payment history
    getPaymentHistory: async (req, res) => {
        try {
            const { code_id } = req.params;
            
            if (!code_id) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Code ID is required',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            // Token verification handled by middleware
            // User info available in req.user

            const query = `
                SELECT * FROM tbl_payment_history 
                WHERE code_id = ? 
                ORDER BY payment_time DESC
            `;
            
            const [rows] = await pool.execute(query, [code_id]);
            
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'Payment history retrieved successfully',
                data: rows,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error fetching payment history:', error);
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failed to fetch payment history',
                errors: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Get user's purchased shop items
    getUserPurchasedItems: async (req, res) => {
        try {
            const { code_id, id } = req.params;
            console.log("code_id",code_id);
            console.log("id",id);
            if (!code_id && !id) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Code ID and ID is required',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            // Token verification handled by middleware
            // User info available in req.user

            const purchasedItems = await paymentService.getUserPurchasedItems(id);
            
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'User purchased items retrieved successfully',
                data: purchasedItems,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error fetching user purchased items:', error);
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failed to fetch user purchased items',
                errors: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Get user's purchased shop items (code_id from JSON body)
    getUserPurchasedItemsFromBody: async (req, res) => {
        try {
            const { code_id, id } = req.body;
            
            if (!code_id && !id) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: 'Code ID and ID is required in request body',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }

            // Token verification handled by middleware
            // User info available in req.user

            const purchasedItems = await paymentService.getUserPurchasedItems(id);
            
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'User purchased items retrieved successfully',
                data: purchasedItems,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error fetching user purchased items:', error);
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failed to fetch user purchased items',
                errors: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
};

module.exports = paymentController; 