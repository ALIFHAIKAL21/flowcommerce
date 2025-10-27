import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Orders } from '../orders/orders.entity';

@Controller('payment')
export class PaymentController {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepo: Repository<Orders>,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as any,
    });

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
    } catch (err) {
      console.error('❌ Webhook signature failed:', (err as Error).message);
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    console.log('⚡ Received Stripe Event:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await this.ordersRepo.findOne({
        where: { payment_intent_id: paymentIntent.id },
      });

      if (order) {
        order.status = 'paid';
        await this.ordersRepo.save(order);
        console.log('💾 Order updated to PAID:', order.id_order);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await this.ordersRepo.findOne({
        where: { payment_intent_id: paymentIntent.id },
      });

      if (order) {
        order.status = 'canceled';
        await this.ordersRepo.save(order);
        console.log('💾 Order updated to CANCELED:', order.id_order);
      }
    }

    return { received: true };
  }
}
