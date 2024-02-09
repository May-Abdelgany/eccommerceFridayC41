

const validation = (schema, containHeaders = false) => {
    return (req, res, next) => {
        //all data without headers
        let data = { ...req.body, ...req.params, ...req.query }
        if (req.file) {
            data.file = req.file
        }
        if (req.files) {
            data.files = req.files
        }
        if (req.headers.authorization && containHeaders) {
            //token
            data = { authorization: req.headers.authorization }
        }

        const validationResult = schema.validate(data, { abortEarly: false })
        if (validationResult.error) {
            req.validationError = validationResult.error
            return next(new Error("validation error", { cause: 400 }))
        }
        return next()
    }
}

export default validation