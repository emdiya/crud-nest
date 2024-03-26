// car.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { CarRepository } from './car.repo'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([Car, CarRepository]),
  ],
  exports: [TypeOrmModule],
})
export class CarModule {}
