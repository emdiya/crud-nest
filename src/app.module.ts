import { Module ,Get, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CarModule } from './car/car.module';
import { CarService } from './car/car.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './car/car.entity';
import { CarRepository } from './car/car.repo';
import { CarController } from './car/car.controller';
import { RequestLoggerMiddleware } from './request-logger.middleware';
@Module({
  imports: [
    CarModule,
    TypeOrmModule.forFeature([Car,CarRepository]),
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
      type:"postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    })
  ],
  controllers: [CarController],
  providers: [CarService],
  
})
export class AppModule  implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*');
  }
 
}
