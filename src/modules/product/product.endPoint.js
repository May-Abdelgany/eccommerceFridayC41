import roles from "../../utils/roles.js";

const productEndPoints = {
    create: [roles.Admin],
    update: [roles.Admin]
}


export default productEndPoints