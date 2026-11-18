import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, deleteAccountSchema } from '@smartresume/shared';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/me', UsersController.getMe);
usersRouter.patch('/me', validate({ body: updateProfileSchema }), UsersController.updateMe);
usersRouter.patch('/me/password', validate({ body: changePasswordSchema }), UsersController.changePassword);
usersRouter.delete('/me', validate({ body: deleteAccountSchema }), UsersController.deleteAccount);
usersRouter.get('/me/export', UsersController.exportData);
