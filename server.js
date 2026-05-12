import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Initialize Stripe (only if key is provided)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

// Create Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe not configured' });
  }

  const { amount, currency = 'eur', customer } = req.body ?? {};

  if (!amount || amount < 50) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // already in cents from frontend
      currency,
      metadata: {
        customer_name: customer?.name || '',
        customer_email: customer?.email || '',
        delivery_address: `${customer?.address || ''}, ${customer?.zip || ''} ${customer?.city || ''}`,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ message: 'Payment intent creation failed' });
  }
});

// Stripe webhook (for order confirmation)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(400).json({ message: 'Webhook not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Payment succeeded:', paymentIntent.id, paymentIntent.metadata);
    // TODO: Save order to database, send confirmation email, etc.
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Sushi for Friends API running on http://localhost:${PORT}`);
  if (!stripe) console.log('⚠ Stripe not configured - running in demo mode');
});
