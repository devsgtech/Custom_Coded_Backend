const pool = require('../config/database');

// Initialize Stripe only if secret key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn('STRIPE_SECRET_KEY not found in environment variables. Stripe functionality will be disabled.');
}

const paymentService = {
    // Get shop item by ID and fetch amount
    getShopItemById: async (shopId) => {
        try {
            const query = `
                SELECT id, category_id, name, description, amount, \`key\` 
                FROM tbl_shop 
                WHERE id = ? AND id IS NOT NULL
            `;
            const [rows] = await pool.execute(query, [shopId]);
            
            if (rows.length === 0) {
                throw new Error('Shop item not found');
            }
            
            return rows[0];
        } catch (error) {
            console.error('Error fetching shop item:', error);
            throw error;
        }
    },

    // Get shop items by IDs and fetch amounts
    getShopItemsByIds: async (shopIds) => {
        try {
            const placeholders = shopIds.map(() => '?').join(',');
            const query = `
                SELECT id, category_id, name, value, description, amount, \`key\` 
                FROM tbl_shop 
                WHERE id IN (${placeholders}) AND id IS NOT NULL
            `;
            const [rows] = await pool.execute(query, shopIds);
            
            if (rows.length === 0) {
                throw new Error('Shop items not found');
            }
            
            return rows;
        } catch (error) {
            console.error('Error fetching shop items:', error);
            throw error;
        }
    },

    // Create Stripe Payment Intent for multiple items
    createPaymentIntent: async (shopIds, codeId, quantities = [], id, payment_ip) => {
        try {
            if (!stripe) {
                throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
            }

            // Ensure shopIds is an array
            const shopIdsArray = Array.isArray(shopIds) ? shopIds : [shopIds];
            const quantitiesArray = Array.isArray(quantities) ? quantities : [quantities];
            
            // If single quantity provided, apply to all items
            if (quantitiesArray.length === 1 && shopIdsArray.length > 1) {
                const singleQuantity = quantitiesArray[0];
                quantitiesArray.length = 0; // Clear array
                for (let i = 0; i < shopIdsArray.length; i++) {
                    quantitiesArray.push(singleQuantity);
                }
            }

            // Get shop items details
            const shopItems = await paymentService.getShopItemsByIds(shopIdsArray);
            
            // Calculate total amount in cents (Stripe requires amounts in cents)
            let totalAmount = 0;
            const itemsWithQuantities = shopItems.map((item, index) => {
                const quantity = quantitiesArray[index] || 1;
                const itemTotal = item.amount * quantity;
                totalAmount += itemTotal;
                return { ...item, quantity, itemTotal };
            });
            
            totalAmount = Math.round(totalAmount * 100); // Convert to cents
            // Create Payment Intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount,
                currency: 'usd',
                metadata: {
                    shop_ids: shopIdsArray.join(','),
                    code_id: id,
                    generated_code_id: codeId,
                    quantities: quantitiesArray.join(','),
                    shop_names: shopItems.map(item => item.name).join(','),
                    shop_keys: shopItems.map(item => item.key).join(','),
                    value: shopItems.map(item => item.value).join(',')
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Save initial payment record with paymentIntentId and clientSecret
            await paymentService.createInitialPaymentRecord({
                code_id: id,
                generated_code_id: codeId,
                shop_id: shopIdsArray.join(','), // Store as comma-separated
                payment_intent_id: paymentIntent.id,
                client_secret: paymentIntent.client_secret,
                amount_paid: totalAmount / 100, // Convert back to dollars
                payment_ip: payment_ip,
                payment_quantity: quantitiesArray.reduce((sum, qty) => sum + (qty || 1), 0)
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: totalAmount,
                shopItems: itemsWithQuantities
            };
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    },
    // Save initial payment record
    createInitialPaymentRecord: async ({ code_id, generated_code_id, shop_id, payment_intent_id, client_secret, amount_paid, payment_ip, payment_quantity }) => {
        try {
            const query = `
                INSERT INTO tbl_payment_history
                (code_id, generated_code_id, shop_id, paymentIntentId, clientSecret, amount_paid, payment_ip, payment_quantity, payment_status, payment_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await pool.execute(query, [
                code_id,
                generated_code_id,
                shop_id,
                payment_intent_id,
                client_secret,
                amount_paid,
                payment_ip,
                payment_quantity,
                false // payment_status: not paid yet
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating initial payment record:', error);
            throw error;
        }
    },

    // Verify payment with Stripe
    verifyPayment: async (paymentIntentId) => {
        try {
            if (!stripe) {
                throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    },

    // Update payment record after verification
    updatePaymentRecordAfterVerification: async (paymentIntent) => {
        try {
            
            // Check if payment record already exists and is already marked as succeeded
            const checkQuery = `
                SELECT payment_status FROM tbl_payment_history 
                WHERE paymentIntentId = ?
            `;
            
            const [existingPayment] = await pool.execute(checkQuery, [paymentIntent.id]);
            
            // Only update if payment doesn't exist or is not already succeeded
            if (existingPayment.length === 0 || existingPayment[0].payment_status === false) {
                const query = `
                    UPDATE tbl_payment_history
                    SET amount_paid = ?, payment_status = ?, CHECKOUT_EMAIL = ?, BILLING_COUNTRY = ?, ISSUER_COUNTRY = ?, CHARGE_STATUS = ?, CHECKOUT_TIMESTAMP = ?, PDT_NO = ?, QTY = ?
                    WHERE paymentIntentId = ?
                `;
                
                // Calculate total quantity from quantities array
                const quantities = paymentIntent.metadata.quantities ? paymentIntent.metadata.quantities.split(',').map(q => parseInt(q) || 1) : [1];
                const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

                const [result] = await pool.execute(query, [
                    paymentIntent.amount / 100,
                    true,
                    paymentIntent.receipt_email || null,
                    paymentIntent.charges?.data[0]?.billing_details?.address?.country || null,
                    paymentIntent.charges?.data[0]?.payment_method_details?.card?.country || null,
                    paymentIntent.status,
                    new Date(paymentIntent.created * 1000),
                    paymentIntent.id,
                    totalQuantity,
                    paymentIntent.id
                ]);
            } else {
                // console.log(`Payment ${paymentIntent.id} already marked as succeeded, skipping update`);
            }

            // Store purchased shop items in tbl_payments_Shop
            if (paymentIntent.status === 'succeeded') {
                await paymentService.storePurchasedShopItems(paymentIntent);
            }

            return true;
        } catch (error) {
            console.error('Error updating payment record after verification:', error);
            throw error;
        }
    },

    // Store purchased shop items in tbl_payments_Shop
    storePurchasedShopItems: async (paymentIntent) => {
        try {
            const shopIds = paymentIntent.metadata.shop_ids.split(',');
            const quantities = paymentIntent.metadata.quantities.split(',');
            const shopNames = paymentIntent.metadata.shop_names.split(',');
            const shopKeys = paymentIntent.metadata.shop_keys.split(',');
            const codeId = paymentIntent.metadata.code_id;
            const generatedCodeId = paymentIntent.metadata.generated_code_id;

            // Get shop items details to get amounts
            const shopItems = await paymentService.getShopItemsByIds(shopIds);
            console.log("shopItems",shopItems)
            // Store each purchased item
            for (let i = 0; i < shopIds.length; i++) {
                const shopItem = shopItems.find(item => item.id == shopIds[i]);
                if (shopItem) {
                    console.log("shopItem",shopItem)
                    // Check if this item already exists for this code_id and shop key
                    const checkQuery = `
                        SELECT id FROM tbl_payments_Shop 
                        WHERE code_id = ? AND name = ? AND stripe_payment_intent_id = ?
                    `;
                
                    const [existingItems] = await pool.execute(checkQuery, [
                        codeId,
                        shopKeys[i] || shopItem.key,
                        paymentIntent.id
                    ]);

                    // Only insert if this item doesn't already exist
                    if (existingItems.length === 0) {
                        console.log("shopItem.value",shopItem.value)
                        const insertQuery = `
                            INSERT INTO tbl_payments_Shop 
                            (code_id, amount, name, currency, stripe_payment_intent_id, stripe_customer_id, status, value, account_type, createdAt, updatedAt)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        `;

                        await pool.execute(insertQuery, [
                            codeId,
                            shopItem.amount,
                            shopItem.key,
                            'USD',
                            paymentIntent.id,
                            paymentIntent.customer || null,
                            'succeeded',
                            shopItem.value,
                            'premium'
                        ]);
                        
                        // console.log(`Stored shop item: ${shopKeys[i] || shopItem.key} for payment ${paymentIntent.id}`);
                    } else {
                        // console.log(`Skipped duplicate item: ${shopKeys[i] || shopItem.key} for payment ${paymentIntent.id}`);
                    }
                }
            }

            // console.log(`Processed ${shopIds.length} shop items for payment ${paymentIntent.id}`);
        } catch (error) {
            console.error('Error storing purchased shop items:', error);
            throw error;
        }
    },

    // Record payment in database (legacy, not used in new flow)
    recordPayment: async (paymentData) => {
        try {
            const {
                code_id,
                amount_paid,
                payment_ip,
                payment_status,
                payment_quantity,
                checkout_email,
                billing_country,
                issuer_country,
                charge_status,
                checkout_timestamp,
                pdt_no,
                qty
            } = paymentData;

            const query = `
                INSERT INTO tbl_payment_history (
                    code_id, amount_paid, payment_time, payment_ip, payment_status, 
                    payment_quantity, CHECKOUT_EMAIL, BILLING_COUNTRY, ISSUER_COUNTRY, 
                    CHARGE_STATUS, CHECKOUT_TIMESTAMP, PDT_NO, QTY
                ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                code_id,
                amount_paid,
                payment_ip,
                payment_status,
                payment_quantity,
                checkout_email,
                billing_country,
                issuer_country,
                charge_status,
                checkout_timestamp,
                pdt_no,
                qty
            ]);

            return result.insertId;
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    // Update payment status
    updatePaymentStatus: async (paymentId, status) => {
        try {
            const query = `
                UPDATE tbl_payment_history 
                SET payment_status = ? 
                WHERE payment_id = ?
            `;
            
            const [result] = await pool.execute(query, [status, paymentId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Get payment by ID
    getPaymentById: async (paymentId) => {
        try {
            const query = `
                SELECT * FROM tbl_payment_history 
                WHERE payment_id = ?
            `;
            
            const [rows] = await pool.execute(query, [paymentId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw error;
        }
    },

    // Get user's purchased shop items
    getUserPurchasedItems: async (codeId) => {
        try {
            const query = `
                SELECT * FROM tbl_payments_Shop 
                WHERE code_id = ? AND status = 'succeeded'
                ORDER BY createdAt DESC
            `;
            
            const [rows] = await pool.execute(query, [codeId]);
            
            // Group items by account_type
            const groupedItems = {
                normal: [],
                premium: []
            };
            
            rows.forEach(item => {
                if (item.account_type === 'normal') {
                    groupedItems.normal.push(item);
                } else if (item.account_type === 'premium') {
                    groupedItems.premium.push(item);
                }
            });
            
            return groupedItems;
        } catch (error) {
            console.error('Error fetching user purchased items:', error);
            throw error;
        }
    }
};

module.exports = paymentService; 