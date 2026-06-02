import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobEnrichmentsConsumerModule } from '@module/JobEnrichmentsConsumer/enrichments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JobEnrichmentsConsumerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
