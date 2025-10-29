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
    console.log('✅ Webhook received');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as any,
    });

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      // gunakan req.body mentah (karena express.raw)
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
    } catch (err) {
      console.error('❌ Webhook signature failed:', (err as Error).message);
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    console.log('⚡ Event type:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 PaymentIntent success: ${paymentIntent.id}`);

        const order = await this.ordersRepo.findOne({
          where: { payment_intent_id: paymentIntent.id },
        });

        if (order) {
          order.status = 'paid';
          await this.ordersRepo.save(order);
          console.log(`✅ Order ${order.id_order} marked as PAID`);
        } else {
          console.warn(`⚠️ No order found for paymentIntent ${paymentIntent.id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        const order = await this.ordersRepo.findOne({
          where: { payment_intent_id: paymentIntent.id },
        });

        if (order) {
          order.status = 'failed';
          await this.ordersRepo.save(order);
          console.log(`⚠️ Order ${order.id_order} marked as FAILED`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`🚫 Payment canceled: ${paymentIntent.id}`);

        const order = await this.ordersRepo.findOne({
          where: { payment_intent_id: paymentIntent.id },
        });

        if (order) {
          order.status = 'cancelled';
          await this.ordersRepo.save(order);
          console.log(`🚫 Order ${order.id_order} marked as CANCELLED`);
        }
        break;
      }

      default:
        console.log(`⚙️ Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
