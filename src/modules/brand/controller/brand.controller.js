import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  //1
  if (await brandModel.findOne({ name })) {
    // return res.status(409).json({ message: "name already exist" })
    return next(new Error("name already exist", { cause: 409 }));
  }
  //2
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/brand` }
  );
  if (!public_id) {
    return res.status(400).json({ message: "image is required" });
  }
  req.body.image = { public_id, secure_url };
  //3
  req.body.slug = slugify(name);
  //4
  req.body.createdBy = req.user._id;
  const newBrand = await brandModel.create(req.body);
  return res.status(201).json({ message: "done", brand: newBrand });
});

export const allBrands = asyncHandler(async (req, res, next) => {
  const brands = await brandModel.find();
  return res.status(200).json({ message: "done", brands });
});
export const oneBrand = asyncHandler(async (req, res, next) => {
  const brand = await brandModel.findById({ _id: req.params.brandId });
  return res.status(200).json({ message: "done", brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await brandModel.findById({ _id: brandId });
  if (!brand) {
    return res.status(404).json({ message: "brand not found" });
  }

  if (req.body.name) {
    //1
    if (await brandModel.findOne({ name: req.body.name })) {
      return res.status(409).json({ message: "name already exist" });
    }
    req.body.slug = slugify(req.body.name);
  }

  if (req.file) {
    //2
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/brand` }
    );
    if (!public_id) {
      return res.status(400).json({ message: "image is required" });
    }
    req.body.image = { public_id, secure_url };

    await cloudinary.uploader.destroy(brand.image.public_id);
  }

  req.body.updatedBy = req.user._id;
  //4
  const updatedBrand = await brandModel.findOneAndUpdate(
    { _id: brandId },
    req.body,
    { new: true }
  );
  return res.status(201).json({ message: "done", brand: updatedBrand });
});
