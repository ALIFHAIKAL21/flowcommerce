import { Controller, Post, Req, Headers, BadRequestException, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Orders } from '../orders/orders.entity';

@Controller('payment')
export class PaymentController {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepo: Repository<Orders>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as any,
    });
  }

  // Stripe Webhook handler
@Post('webhook')
@HttpCode(200)
async handleWebhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
  // Kalo simulasi dari UI (tanpa signature)
  if (!signature) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const paymentIntentId = body?.data?.object?.id;

    const order = await this.ordersRepo.findOne({
      where: { payment_intent_id: paymentIntentId },
    });

    if (order) {
      order.status = 'paid';
      await this.ordersRepo.save(order);
      console.log(`✅ SIMULATED PAYMENT: Order ${order.id_order} marked as PAID`);
      return { received: true, message: 'Simulated payment success' };
    }

    return { received: false, message: 'No order found for simulation' };
  }

  // --- real Stripe webhook ---
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;
  try {
    event = this.stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature failed:', (err as Error).message);
    throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await this.ordersRepo.findOne({
      where: { payment_intent_id: paymentIntent.id },
    });
    if (order) {
      order.status = 'paid';
      await this.ordersRepo.save(order);
      console.log(`✅ REAL PAYMENT: Order ${order.id_order} marked as PAID`);
    }
  }

  return { received: true };
}

}
