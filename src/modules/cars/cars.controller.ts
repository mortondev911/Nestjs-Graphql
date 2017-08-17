'use strict';

import { Controller, Get, Post, Put, Delete, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageCodeError } from '../../lib/error/MessageCodeError';
import { models, sequelize } from '../../models/index';

@Controller()
export class CarsController {
    @Get('cars')
    public async index (req: Request, res: Response) {
        const cars = await models.Car.findAll();
        return res.status(HttpStatus.OK).json(cars);
    }

    @Post('cars')
    public async create (req: Request, res: Response) {
        const body = req.body;
        if (!body || (body && Object.keys(body).length === 0)) throw new MessageCodeError('car:create:missingInformation');

        await sequelize.transaction(async t => {
            return await models.Car.create(body, { transaction: t });
        });

        return res.status(HttpStatus.CREATED).send();
    }

    @Get('cars/:id')
    public async show (req: Request, res: Response) {
        const id = req.params.id;
        if (!id) throw new MessageCodeError('car:show:missingId');

        const car = await models.Car.findOne({
            where: { id }
        });
        return res.status(HttpStatus.OK).json(car);
    }

    @Put('cars/:id')
    public async update (req: Request, res: Response) {
        const id = req.params.id;
        const body = req.body;
        if (!id) throw new MessageCodeError('car:update:missingId');
        if (!body || (body && Object.keys(body).length === 0)) throw new MessageCodeError('car:update:missingInformation');

        await sequelize.transaction(async t => {
            const car = await models.Car.findOne({
                where: {
                    id,
                    userId: req['loggedInUser']
                },
                transaction: t
            });
            if (!car) throw new MessageCodeError('car:notFound');

            /* Keep only the values which was modified. */
            const newValues = {};
            for (const key of Object.keys(body)) {
                if (car.getDataValue(key) !== body[key]) newValues[key] = body[key];
            }

            return await car.update(newValues, { transaction: t });
        });

        return res.status(HttpStatus.OK).send();
    }

    @Delete('cars/:id')
    public async delete (req: Request, res: Response) {
        const id = req.params.id;
        if (!id) throw new MessageCodeError('car:delete:missingId');

        await
        sequelize.transaction(async t => {
            return await models.Car.destroy({
                where: { id },
                transaction: t
            });
        });

        return res.status(HttpStatus.OK).send();
    }
}
