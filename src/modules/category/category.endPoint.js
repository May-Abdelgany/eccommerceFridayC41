import roles from "../../utils/roles.js";

const categoryEndPoints = {
    create: [roles.Admin],
    update: [roles.Admin]
}


export default categoryEndPoints