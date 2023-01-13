import {Router} from "express";

import express from "express";

import * as usersController  from "../controllers/users.controller";

import {isGuest, isLogged} from "../middlewares/guards.middleware";


// TODO: put back guards when fixed!
export const router = Router();

router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.post('/logout', usersController.logout);
