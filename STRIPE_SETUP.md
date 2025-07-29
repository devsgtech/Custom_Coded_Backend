# Stripe Payment Integration Setup

## Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Currency and Amount Format

**Important:** All amounts in the API responses follow Stripe's format:
- **`amount`**: The total amount in cents (e.g., 1850 = $18.50)
- **`amountInCents`**: Boolean flag indicating if the amount is in cents
- **`currency`**: Always "USD" for US Dollar

**Examples:**
- `amount: 1850, amountInCents: true` = $18.50
- `amount: 1000, amountInCents: true` = $10.00
- `amount: 18.50, amountInCents: false` = $18.50 (after payment verification)

## API Endpoints

### 1. Create Payment Intent
**POST** `/api/payment/create-payment-intent`

**Headers (Optional):**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "shop_id": [1, 2, 3],
  "code_id": 123,
  "quantity": [1, 2, 1],
  "id": 456,
  "payment_ip": "192.168.1.1",
  "token": "<your_jwt_token>"
}
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 1850,
    "amountInCents": true,
    "currency": "USD",
    "shopItems": [
      {
        "id": 1,
        "category_id": 1,
        "name": "Video Upgrade",
        "description": "Upgrade to video features",
        "amount": 10.00,
        "key": "video_upgrade",
        "quantity": 1,
        "itemTotal": 10.00
      },
      {
        "id": 2,
        "category_id": 2,
        "name": "Audio Upgrade",
        "description": "Upgrade to audio features",
        "amount": 15.00,
        "key": "audio_upgrade",
        "quantity": 2,
        "itemTotal": 30.00
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Verify Payment
**POST** `/api/payment/verify-payment`

**Headers (Optional):**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "token": "<your_jwt_token>"
}
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payment verified successfully",
  "data": {
    "paymentStatus": "succeeded",
    "amount": 18.50,
    "amountInCents": false,
    "currency": "USD",
    "shopItems": [
      {
        "id": 1,
        "name": "Video Upgrade",
        "key": "video_upgrade"
      },
      {
        "id": 2,
        "name": "Audio Upgrade",
        "key": "audio_upgrade"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Get Payment History
**GET** `/api/payment/history/:code_id`

**Headers (Optional):**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters (Optional):**
```
?token=<your_jwt_token>
```

### 4. Get User's Purchased Items
**POST** `/api/payment/purchased-items`

**Headers (Optional):**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "code_id": "dLnLbhFd9L",
  "token": "<your_jwt_token>"
}
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "payment_id": 1,
      "code_id": 123,
      "amount_paid": 10.00,
      "payment_time": "2024-01-01T00:00:00.000Z",
      "payment_ip": "192.168.1.1",
      "payment_status": true,
      "payment_quantity": 1,
      "CHECKOUT_EMAIL": "user@example.com",
      "BILLING_COUNTRY": "US",
      "ISSUER_COUNTRY": "US",
      "CHARGE_STATUS": "succeeded",
      "CHECKOUT_TIMESTAMP": "2024-01-01T00:00:00.000Z",
      "PDT_NO": "pi_xxx",
      "QTY": 1
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Stripe Webhook
**POST** `/api/payment/webhook`

This endpoint receives webhook events from Stripe. Configure this URL in your Stripe dashboard.

## Frontend Integration

### 1. Install Stripe.js
```html
<script src="https://js.stripe.com/v3/"></script>
```

### 2. Initialize Stripe
```javascript
const stripe = Stripe('pk_test_your_publishable_key');
```

### 3. Create Payment Intent (Frontend)
```javascript
// Method 1: Token in Authorization header
const response = await fetch('/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    shop_id: [1, 2, 3],
    code_id: 123,
    quantity: [1, 2, 1],
    id: 456,
    payment_ip: "192.168.1.1"
  })
});

// Method 2: Token in JSON body
const response = await fetch('/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    shop_id: [1, 2, 3],
    code_id: 123,
    quantity: [1, 2, 1],
    id: 456,
    payment_ip: "192.168.1.1",
    token: userToken
  })
});

const { clientSecret } = await response.json();
```

### 4. Confirm Payment
```javascript
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: 'https://your-domain.com/payment-success',
  },
});

if (error) {
  console.error('Payment failed:', error);
} else {
  // Payment succeeded
  console.log('Payment successful!');
}
```

## Database Schema

The payment integration uses your existing `tbl_payment_history` table:

```sql
CREATE TABLE tbl_payment_history (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  code_id INT NOT NULL,
  amount_paid INT NOT NULL,
  payment_time DATETIME NOT NULL,
  payment_ip VARCHAR(255) NOT NULL,
  payment_status BOOLEAN NOT NULL DEFAULT FALSE,
  payment_quantity INT NOT NULL,
  CHECKOUT_EMAIL VARCHAR(255),
  BILLING_COUNTRY VARCHAR(255),
  ISSUER_COUNTRY VARCHAR(255),
  CHARGE_STATUS VARCHAR(255),
  CHECKOUT_TIMESTAMP DATETIME,
  PDT_NO VARCHAR(255),
  QTY INT
);
```

## Security Considerations

1. **JWT Authentication**: All payment endpoints require valid JWT tokens
2. **Code ID Validation**: Users can only access payments for their own code_id
3. **Webhook Verification**: Always verify webhook signatures using `STRIPE_WEBHOOK_SECRET`
4. **HTTPS**: Use HTTPS in production for all payment endpoints
5. **Environment Variables**: Never commit Stripe keys to version control
6. **Error Handling**: Implement proper error handling for failed payments
7. **Idempotency**: Handle duplicate webhook events gracefully

## Testing

1. Use Stripe test keys for development
2. Test with Stripe's test card numbers
3. Use Stripe CLI to test webhooks locally
4. Verify payment recording in database after successful payments 