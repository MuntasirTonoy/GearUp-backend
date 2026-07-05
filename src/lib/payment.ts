import Stripe from 'stripe';
import config from '../config/index.js';

const stripe = new Stripe(config.payment.stripeSecretKey, {
  apiVersion: '2023-10-16' as any, // Cast to any to bypass strict literal type checks across different stripe versions
});

export default stripe;
