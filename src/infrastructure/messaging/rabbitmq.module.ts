import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
      exchanges: [
        {
          name: 'jobs',
          type: 'direct',
        },
      ],
    }),
  ],
})
export class RabbitmqModule {}
