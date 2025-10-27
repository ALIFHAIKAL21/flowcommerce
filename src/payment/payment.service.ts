import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as any
    });
  }

  async createPaymentIntent(amount: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  }

  async retrievePaymentIntent(id: string) {
    return this.stripe.paymentIntents.retrieve(id);
  }

  async refundPayment(paymentIntentId: string) {
  try {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (err) {
    console.error('❌ Refund failed:', err.message);
    throw err;
  }
}

}
