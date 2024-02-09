import { customAlphabet } from "nanoid";
import userModel from "../../../../DB/model/User.model.js";
import { generateToken, verifyToken } from "../../../utils/GenerateAndVerifyToken.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import sendEmail from "../../../utils/email.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


//1-check if email exist
//2-token &&refresh
//3-send email  
//4-hash password  sadasdas@gmail.com
//5-create user
export const signUp = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body
        const emailExist = await userModel.findOne({ email })
        if (emailExist) {
            return next(new Error('email already exist', { cause: 409 }))
        }
        const token = generateToken({ payload: { email }, signature: process.env.EMAIL_SIGNATURE, expiresIn: 60 * 30 })
        const rf_token = generateToken({ payload: { email }, signature: process.env.EMAIL_SIGNATURE, expiresIn: 60 * 60 * 24 })
        //http://localhost:5000/auth/confirmEmail/isddasdasdasdas
        const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
        const rf_link = `${req.protocol}://${req.headers.host}/auth/refreshToken/${rf_token}`

        const html = `
        <a href=${link} style="color:red;">confirm email</a>
        <br>
        <br>
        <a href=${rf_link} style="color:red;">send new email</a>
        `
        //return true or false
        if (!sendEmail({ to: email, subject: 'confirm email', html })) {
            return next(new Error('faill to send email', { cause: 400 }))
        }
        req.body.password = hash({ plaintext: req.body.password })
        const user = await userModel.create(req.body)
        return res.json({ message: "done", _id: user._id })
    }
)


//1-get token
//2-verify token -->payload
//3-find email -->redirect signup
//4-confirm email (true) -->redirect login
//5-update confirm email (true) -->redirect login
export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { token } = req.params
        const { email } = verifyToken({ token, signature: process.env.EMAIL_SIGNATURE })
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.redirect('https://www.linkedin.com/feed/')
        }
        if (user.confirmEmail) {
            return res.redirect('https://www.facebook.com/groups/562231568341852/?ref=share&mibextid=KtfwRi')
        }
        await userModel.updateOne({ email }, { confirmEmail: true })
        return res.redirect('https://www.facebook.com/groups/562231568341852/?ref=share&mibextid=KtfwRi')
    }
)

//1-get token
//2-verify token -->payload
//3-find email
//4-confirm email (true)-->login
//5-create token and new link
//6-send email 
//7-check your email 
export const refreshToken = asyncHandler(
    async (req, res, next) => {
        const { token } = req.params
        const { email } = verifyToken({ token, signature: process.env.EMAIL_SIGNATURE })
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.redirect('https://www.linkedin.com/feed/')
        }
        if (user.confirmEmail) {
            return res.redirect('https://www.facebook.com/groups/562231568341852/?ref=share&mibextid=KtfwRi')
        }
        const newToken = generateToken({ payload: { email }, signature: process.env.EMAIL_SIGNATURE, expiresIn: 60 * 10 })
        const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`
        const html = `<a href=${link} style="color:red;">confirm email</a>`
        //return true or false
        if (!sendEmail({ to: email, subject: 'confirm email', html })) {
            return next(new Error('faill to send email', { cause: 400 }))
        }

        return res.send('<h1>Cheack your email</h1>')
    }
)


//1-get email and password
//2-check email -->
//3-check if email confirmed
//4-compare password 
//5-check if email is deleted -->true -->false
//6-generate token 

export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return next(new Error('email or password is not valid', { cause: 400 }))
        }
        if (!user.confirmEmail) {
            return next(new Error('please confirm email', { cause: 400 }))
        }
        const match = compare({ plaintext: password, hashValue: user.password })
        if (!match) {
            return next(new Error('email or password is not valid', { cause: 400 }))
        }
        if (user.isDeleted) {
            user.isDeleted = false
        }
        user.status = 'Online'
        await user.save()
        const token = generateToken({ payload: { email, id: user._id, role: user.role }, expiresIn: 60 * 30 })
        const refreshToken = generateToken({ payload: { email, id: user._id, role: user.role }, expiresIn: 60 * 60 * 24 * 30 })
        return res.status(200).json({ message: "done", token, refreshToken })
    }
)


export const sendCode = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return next(new Error('invalid email', { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error('confirm email first', { cause: 400 }))
        }
        const nanId = customAlphabet('1234567890', 5)
        const code = nanId()
        if (!sendEmail({ to: email, subject: 'forget password', html: `<h1>${code}</h1>` })) {
            return next(new Error('faill to send email', { cause: 400 }))
        }
        await userModel.updateOne({ email }, { code })
        return res.status(200).json({ message: "check your email" })
    }
)


export const forgetPassword = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return next(new Error('invalid email', { cause: 404 }))
        }
        if (code != user.code) {
            return next(new Error('code invalid', { cause: 400 }))
        }
        let password = hash({ plaintext: req.body.password })

        const updateUser = await userModel.findOneAndUpdate({ email }, { password, code: null, status: 'Offline' }, { new: true })
        return res.status(200).json({ message: 'done', updateUser })
    }
)