import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import { nanoid } from "nanoid";
import productModel from "../../../../DB/model/Product.model.js";
import ApiFeatures from "../../../utils/apiFeatures.js";

//1-check if categoryExist
//2-subcategory if exist -->(categoryId =categoryId)
//3-brand if exist
//4-slug
//5-totalPrice=>price -(price*dicount)

//6-upload main image
//7-if subImage ==>upload
//8-createdBy

export const createProduct = asyncHandler(async (req, res, next) => {
  const { categoryId, brandId, subCategoryId } = req.body;
  if (!(await categoryModel.findOne({ _id: categoryId, isDeleted: false }))) {
    return next(new Error("invalid category id", { cause: 404 }));
  }
  if (
    !(await subCategoryModel.findOne({
      _id: subCategoryId,
      isDeleted: false,
      categoryId,
    }))
  ) {
    return next(new Error("invalid subCategory id", { cause: 404 }));
  }
  if (!(await brandModel.findOne({ _id: brandId, isDeleted: false }))) {
    return next(new Error("invalid brand id", { cause: 404 }));
  }
  req.body.slug = slugify(req.body.name, {
    trim: true,
    lower: true,
  });
  // 500-((500*50)/100)=250  price-((price*discount)/100)
  // if(req.body.discount){
  //     req.body.totalPrice = req.body.price - ((req.body.price * req.body.discount) / 100)
  // }else{
  //     req.body.totalPrice = req.body.price
  // }
  req.body.totalPrice =
    req.body.price - (req.body.price * req.body.discount || 0) / 100;
  req.body.customId = nanoid();
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.APP_NAME}/category/${categoryId}/subCategory/${subCategoryId}/products/${req.body.customId}/mainImage`,
    }
  );
  if (!public_id) {
    return res.status(400).json({ message: "image is required" });
  }
  req.body.mainImage = { public_id, secure_url };
  let images = [];
  if (req.files?.subImages?.length) {
    for (const image of req.files.subImages) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.APP_NAME}/category/${categoryId}/subCategory/${subCategoryId}/products/${req.body.customId}/subImages`,
        }
      );
      if (!public_id) {
        return res.status(400).json({ message: "image is required" });
      }
      images.push({ public_id, secure_url });
    }
    req.body.subImages = images;
  }

  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);
  return res.status(201).json({ message: "done", product });
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
  //   let { page, size } = req.query;
  //   if (!page || page <= 0) {
  //     page = 1;
  //   }
  //   if (!size || size <= 0) {
  //     size = 3;
  //   }
  //   const skip = (page - 1) * size;

  //   const excludeQuery = req.query;
  //   const includeArray = ["page", "size", "sort", "fields", "search"];
  //   includeArray.forEach((element) => {
  //     console.log(element);
  //     delete excludeQuery[element];
  //   });
  //   const filter = JSON.parse(
  //     JSON.stringify(excludeQuery).replace(
  //       /(gt|lt|gte|lte|eq|in|nin|ne)/g,
  //       (match) => `$${match}`
  //     )
  //   );
  //   console.log(req.query);

  //   if (req.query.sort) {
  //     req.query.sort = req.query.sort.replaceAll(",", " ");
  //   }

  //   if (req.query.fields) {
  //     req.query.fields = req.query.fields.replaceAll(",", " ");
  //   }
  //   console.log(req.query.sort);
  //   let mongooseQuery = productModel.find();
  //   if (req.query.search) {
  //     mongooseQuery = mongooseQuery.find({
  //       $or: [
  //         { name: { $regex: req.query.search } },

  //         { description: { $regex: req.query.search } },
  //       ],
  //     });
  //   }

  // .sort(req.query.sort)
  // .select(req.query.fields); //filter
  //   mongooseQuery = mongooseQuery.limit(size).skip(skip);
  //   const products = await mongooseQuery;

  //   const products = productModel.find({}).limit(size).skip(skip);

  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .fields()
    .search();

  const products = await apiFeatures.mongooseQuery;
  return res.status(200).json({ message: "done", products });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById({ _id: req.params.productId });
  return res.status(200).json({ message: "done", product });
});

//1-check if product exist
//2-if update category -->check if category exist
//3-if update subCategory -->check if subCategory exist
//4-if update brand -->check if brand exist
//5-if name -->change slug
//6-if change discount or price -->totalprice
//7-if main image upload -->upload image and delete old image
//8-if subImages upload  -->push in subImage array
//9-updatedBy

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { categoryId, brandId, subCategoryId } = req.body;
  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new Error("invalid product id", { cause: 404 }));
  }
  // if (categoryId) {
  //     //categoryId -->true
  //     if (! await categoryModel.findOne({ _id: categoryId, isDeleted: false })) {
  //         return next(new Error('invalid category id', { cause: 404 }))
  //     }
  // }

  if (
    categoryId &&
    !(await categoryModel.findOne({ _id: categoryId, isDeleted: false }))
  ) {
    return next(new Error("invalid category id", { cause: 404 }));
  }
  if (
    subCategoryId &&
    !(await subCategoryModel.findOne({
      _id: subCategoryId,
      isDeleted: false,
      categoryId,
    }))
  ) {
    return next(new Error("invalid subCategory id", { cause: 404 }));
  }
  if (
    brandId &&
    !(await brandModel.findOne({ _id: brandId, isDeleted: false }))
  ) {
    return next(new Error("invalid brand id", { cause: 404 }));
  }
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, {
      trim: true,
      lower: true,
    });
  }

  // if (req.body.discount && req.body.price) {
  //     req.body.totalPrice =
  //         req.body.price - ((req.body.price * req.body.discount) / 100)
  // } else if (req.body.price) {
  //     req.body.totalPrice =
  //         req.body.price - ((req.body.price * product.discount || 0) / 100)
  // } else if (req.body.discount) {
  //     req.body.totalPrice =
  //         product.price - ((product.price * req.body.discount) / 100)
  // }

  req.body.totalPrice =
    (req.body.price || product.price) -
    ((req.body.price || product.price) *
      (req.body.discount || product.discount)) /
      100;

  if (req.files?.mainImage?.length) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: `${process.env.APP_NAME}/category/${
          categoryId || product.categoryId
        }/subCategory/${subCategoryId || product.subCategoryId}/products/${
          product.customId
        }/mainImage`,
      }
    );
    if (!public_id) {
      return res.status(400).json({ message: "image is required" });
    }
    req.body.mainImage = { public_id, secure_url };
    await cloudinary.uploader.destroy(product.mainImage.public_id);
  }

  if (req.files?.subImages?.length) {
    for (const image of req.files.subImages) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.APP_NAME}/category/${categoryId}/subCategory/${subCategoryId}/products/${req.body.customId}/subImages`,
        }
      );
      if (!public_id) {
        return res.status(400).json({ message: "image is required" });
      }
      if (!product.subImages) {
        product.subImages = [];
      }
      product.subImages.push({ public_id, secure_url });
    }
    req.body.subImages = product.subImages;
  }

  req.body.updatedBy = req.user._id;
  const updateProduct = await productModel.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true }
  );
  return res.status(201).json({ message: "done", product: updateProduct });
});
