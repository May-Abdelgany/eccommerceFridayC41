import roles from "../../utils/roles.js";

const subCategoryEndPoints = {
  create: [roles.Admin],
  update: [roles.Admin],
};

export default subCategoryEndPoints;
