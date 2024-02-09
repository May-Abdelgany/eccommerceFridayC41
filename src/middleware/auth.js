import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";


//[Admin,User]
const auth = (role) => {
    return async (req, res, next) => {

        const { authorization } = req.headers;
        if (!authorization) {
            return next(new Error('please login', { cause: 400 }))
            // return res.status(400).json({ message: "please login" })
        }
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            return next(new Error('In-valid bearer key', { cause: 400 }))
            // return res.status(400).json({ message: "In-valid bearer key" })
        }
        const token = authorization.split(process.env.BEARER_KEY)[1]

        if (!token) {
            return next(new Error('In-valid token', { cause: 400 }))
            // return res.status(400).json({ message: "In-valid token" })
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
        if (!decoded?.id) {
            return next(new Error('In-valid token payload', { cause: 400 }))
            // return res.status(400).json({ message: "In-valid token payload" })
        }
        //admin
        //user
        const authUser = await userModel.findById(decoded.id).select('userName email status role')
        if (!authUser) {
            return next(new Error('Not register account', { cause: 404 }))
            // return res.status(404).json({ message: "Not register account" })
        }
        if (authUser.status == 'Offline') {
            return next(new Error('please login', { cause: 400 }))
        }
        if (!role.includes(authUser.role)) {
            return next(new Error('do not have access to do this action', { cause: 401 }))
        }
        req.user = authUser;
        return next()
    }
}

export default auth