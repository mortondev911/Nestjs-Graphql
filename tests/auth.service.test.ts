'use strict';

require('dotenv').config();

import 'mocha';
import { expect } from 'chai';
import { fakeUser } from "./fixtures/fake.data";
import { models, sequelize } from "../src/models/index";
import { AuthService } from "../src/modules/auth/auth.service"

describe('AuthService should', () => {
    let authService;
    let user;

    before(async () => {
        authService = new AuthService();

        /* Create a new user for the test. */
        await sequelize.transaction(async t => {
            return user = await models.User.create(fakeUser, {
                transaction: t,
                returning: true
            });
        });
    });

    after(async () => {
        /* Remove the previous created user. */
        await sequelize.transaction(async t => {
            return await models.User.destroy({
                where: { id: user.getDataValue('id') },
                force: true,
                transaction: t
            });
        });
    });

    it('allow to sign a new token and throw without user found', async () => {
        let error;
        try {
            await authService.sign({
                email: 'undefined@undefined.fr',
                password: 'password'
            });
        } catch (err) {
            error = err;
        }

        expect(error).not.null;
        expect(error.httpStatus).equal(404);
        expect(error.messageCode).equal('user:notFound');
        expect(error.errorMessage).equal('Unable to found the user with the provided information.');
        expect(error.message).equal('Aucun utilisateur trouvé avec les informations fourni.');
    });

    it('allow to sign a new token and return it', async () => {
        const token = await authService.sign({
            email: fakeUser.email,
            password: fakeUser.password
        });

        expect(token).not.null;
        expect(token).to.be.string;
    });
});