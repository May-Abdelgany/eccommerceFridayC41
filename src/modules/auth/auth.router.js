import { Router } from "express";
import validation from "../../middleware/validation.js";
import * as authController from './controller/auth.controller.js'
import * as authValidation from './auth.validation.js'
const router = Router()
router.post(
    '/signUp',
    validation(authValidation.signUpSchema),
    authController.signUp
)
    .get(
        '/confirmEmail/:token',
        validation(authValidation.tokenSchema),
        authController.confirmEmail
    )
    .get(
        '/refreshToken/:token',
        validation(authValidation.tokenSchema),
        authController.refreshToken
    )
    .post(
        '/login',
        validation(authValidation.loginSchema),
        authController.login
    )
    .patch(
        '/sendCode',
        validation(authValidation.sendCodeSchema),
        authController.sendCode
    )
    .put(
        '/forgetPassword',
        validation(authValidation.fogetPasswordSchema),
        authController.forgetPassword
    )
    .post('/loginWithGmail',authController.loginWithGmail)
export default router