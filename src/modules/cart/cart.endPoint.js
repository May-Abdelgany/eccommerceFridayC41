import roles from "../../utils/roles.js";

const cartEndPoints = {
    addToCart: [roles.User],
    update: [roles.Admin]
}


export default cartEndPoints