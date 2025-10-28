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
  ) { }
  @Post('webhook')
  async handleWebhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    console.log('✅ Webhook hit!');
    console.log('🧾 Content-Type:', req.headers['content-type']);
    console.log('🧾 Signature:', sig);
    console.log('🧾 Raw body type:', typeof req.body);
    console.log('🧾 Raw body length:', req.body?.length || req.rawBody?.length);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as any,
    });

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;
    try {
      // ⚠️ gunakan req.body karena express.raw() taruh payload mentah di situ
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
    } catch (err) {
      console.error('❌ Webhook signature failed:', (err as Error).message);
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    console.log('⚡ Stripe Event:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await this.ordersRepo.findOne({
        where: { payment_intent_id: paymentIntent.id },
      });

      if (order) {
        order.status = 'paid';
        await this.ordersRepo.save(order);
        console.log('💾 Order marked as PAID:', order.id_order);
      } else {
        console.warn('⚠️ No order found for this paymentIntent:', paymentIntent.id);
      }
    }

    return { received: true };
  }
}
