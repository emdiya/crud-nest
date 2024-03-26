import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { resolve } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './car.entity';
@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private carRepository: Repository<Car>,
    ) { }

    //FecthCar
    public async getCar(): Promise<{ status: number; message: string; cars: Car[] }> {
        try {
            const cars = await this.carRepository.find();
            if (!cars || cars.length === 0) {
                throw new HttpException('No cars found', HttpStatus.NOT_FOUND);
            }
            return { status: HttpStatus.OK, message: 'success', cars };
        } catch (error) {
            let status = HttpStatus.INTERNAL_SERVER_ERROR;
            let message = 'Internal server error';
            if (error instanceof HttpException) {
                status = error.getStatus();
                const errorMessage = error.getResponse();
                message = typeof errorMessage === 'string' ? errorMessage : 'An error occurred';
            }
            return { status, message, cars: [] };
        }
    }

    //CreateCar
    public async postCar(carData: Partial<Car>): Promise<{ status: number; car: Car; message: string }> {
        try {
            // Check if the ID is provided
            if (carData.hasOwnProperty('id') && carData.id !== undefined) {
                // Check if a car with the same ID already exists
                const existingCar = await this.carRepository.findOne({ where: { id: carData.id } });
                if (existingCar) {
                    throw new HttpException('A car with the provided ID already exists', HttpStatus.CONFLICT);
                }
            }

            // Check if all required fields are provided
            const requiredFields = ['make', 'model', 'year', 'color', 'mileage', 'price', 'transmission', 'engine', 'horsepower', 'features', 'owners', 'image'];
            for (const field of requiredFields) {
                if (!(field in carData) || !carData[field]) {
                    throw new HttpException(`Missing required field: ${field}`, HttpStatus.BAD_REQUEST);
                }
            }

            // Create and save the new car
            const newCar = this.carRepository.create(carData);
            const savedCar = await this.carRepository.save(newCar);

            return { status: HttpStatus.CREATED,message: 'Car added successfully' , car: savedCar, };
        } catch (error) {
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    //GetCar
    public async getCarByID(id: number): Promise<{ status: number; message: string; car: Car }> {
        try {
            const car = await this.carRepository.findOne({ where: { id } });
            if (!car) {
                throw new NotFoundException(`Car with ID ${id} not found`);
            }
            return { status: HttpStatus.OK, message: 'success', car };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //DeleteCar
    public async deleteCarByID(id: number): Promise<{ status: number; message: string }> {
        try {
            const car = await this.carRepository.findOne({ where: { id } });
            if (!car) {
                throw new NotFoundException(`Car with ID ${id} not found`);
            }
            await this.carRepository.remove(car);
            return { status: HttpStatus.OK, message: `Car with ID ${id} deleted successfully` };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //UpdateCar
    public async putCarByID(id: number, carData: Partial<Car>): Promise<{ status: number; message: string; updatedCar?: Car }> {
        try {
            const car = await this.carRepository.findOne({ where: { id } });
            if (!car) {
                throw new NotFoundException(`Car with ID ${id} not found!`);
            }

            // Merge provided data with existing car properties
            const updatedCarData: Partial<Car> = { ...car, ...carData };

            // Save the updated car entity
            const updatedCar = await this.carRepository.save(updatedCarData);

            return { status: HttpStatus.OK, message: `Car with ID ${id} updated successfully`, updatedCar };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
