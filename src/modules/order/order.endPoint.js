import roles from "../../utils/roles.js";

const orderEndPoints = {
    createOrder: [roles.User],
    deliverdOrder: [roles.Admin]
}


export default orderEndPoints