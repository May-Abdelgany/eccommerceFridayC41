import roles from "../../utils/roles.js";

const brandEndPoints = {
  create: [roles.Admin],
  update: [roles.Admin],
};

export default brandEndPoints;
