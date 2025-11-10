import { Controller, Post, Req, Headers, BadRequestException, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Orders } from '../orders/orders.entity';

// Payment Controller to handle Stripe webhooks
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

 // Handle Stripe Webhook
@Post('webhook')
@HttpCode(200)
async handleWebhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
 
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

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;
  try {
  
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
 
    console.log('Webhook raw body length:', rawBody.length);
    event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature failed:', (err as Error).message);
   
    throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
  }

  console.log('✅ Received stripe event:', event.type);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('🔎 PaymentIntent id:', paymentIntent.id, 'amount:', paymentIntent.amount);

    const order = await this.ordersRepo.findOne({
      where: { payment_intent_id: paymentIntent.id }, // pastikan properti ini sesuai entity
    });

    if (!order) {
      console.warn('⚠️ No order found for payment_intent_id:', paymentIntent.id);
    } else {
      order.status = 'paid';
      await this.ordersRepo.save(order);
      console.log(`✅ REAL PAYMENT: Order ${order.id_order} marked as PAID`);
    }
  } else {
    console.log('Ignoring event type', event.type);
  }

  return { received: true };
}



}
