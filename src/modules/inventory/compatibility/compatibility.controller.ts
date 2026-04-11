import { Request, Response } from "express";
import CarModel from "./compatibility.model";
import Product from "../product/product.model";
import { saveImageLocally } from "../../../utils/fileUploadHelper";
import { deleteLocalImage } from "../../../utils/fileDeleteHelper";

/**
 * Add a new car model
 */
// const REL_UPLOAD_BASE = "/uploads/carModels"; // used in URLs returned to client


export const addCarModel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      variants,
      fuelTypes,
      transmissions,
      generations,
      brand,
      brandName,
      brandLogo,
      parentCompany,
    } = req.body;

    // Build brand object (support both patterns)
    let brandObj: any = null;
    if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    else if (brandName || brandLogo || parentCompany)
      brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

    // Parse arrays (frontend sends JSON strings for arrays)
    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants || [];
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes || [];
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions || [];
    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    // files from multer memoryStorage
    const files = req.files as any; // multer types
    // Base image upload
    let baseImageUrl: string | undefined;
    if (files?.baseImage?.[0]) {
      const imageFile = files.baseImage[0];
      // Save to: uploads/cars/
      baseImageUrl = await saveImageLocally(
        imageFile.buffer,
        "cars/baseImages",
        imageFile.originalname
      );
    }

    // generationImages: they are sent as a flat list in the same order as generations
    const genFiles = files?.generationImages || [];
    let pointer = 0;
    for (const generation of parsedGenerations) {
      const imageCount = Number(generation.imagesCount || 0);
      const imageSlice = genFiles.slice(pointer, pointer + imageCount);

      // Save each image to: uploads/cars/
      const savedImages = await Promise.all(
        imageSlice.map((file: any) =>
          saveImageLocally(file.buffer, "cars/generations", file.originalname)
        )
      );

      generation.images = savedImages;
      pointer += imageCount;
    }

    // Duplicate check (name + brand)
    const brandNameToCheck = brandObj?.name ?? "";
    const existing = await CarModel.findOne({ name, "brand.name": brandNameToCheck });
    if (existing) {
      return res.status(400).json({ message: "Car model already exists for this brand" });
    }

    const carModel = await CarModel.create({
      name,
      brand: brandObj,
      baseImage: baseImageUrl,
      variants: parsedVariants,
      fuelTypes: parsedFuelTypes,
      transmissions: parsedTransmissions,
      generations: parsedGenerations,
    });

    return res.status(201).json({ status: "success", message: "Car model added successfully", model: carModel });
  } catch (error: any) {
    console.error("addCarModel error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// export const updateCarModel = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       variants,
//       fuelTypes,
//       transmissions,
//       generations,
//       brand,
//       brandName,
//       brandLogo,
//       parentCompany,
//       baseImageUrl, 
//     } = req.body;

//     // Find existing car model
//     const existingCar = await CarModel.findById(id);
//     if (!existingCar) {
//       return res.status(404).json({ message: "Car model not found" });
//     }

//     // Parse brand object
//     let brandObj: any = null;
//     if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
//     else if (brandName || brandLogo || parentCompany)
//       brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

//     // Parse arrays
//     const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
//     const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes;
//     const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions;
//     const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

//     const files = req.files as any;
//     const imagesToDelete: string[] = [];

//     // ========== 1. HANDLE BASE IMAGE ==========
//     let finalBaseImageUrl = existingCar.baseImage;

//     if (files?.baseImage?.[0]) {
//       // New base image uploaded
//       if (existingCar.baseImage) {
//         imagesToDelete.push(existingCar.baseImage);
//       }
//       finalBaseImageUrl = await saveImageLocally(
//         files.baseImage[0].buffer,
//         "cars/baseImages",
//         files.baseImage[0].originalname
//       );
//     } else if (baseImageUrl) {
//       // Using existing base image URL (no change)
//       finalBaseImageUrl = baseImageUrl;
//     }

//     // ========== 2. HANDLE GENERATION IMAGES ==========
//     const genFiles = files?.generationImages || [];
//     let pointer = 0;

//     // Process each generation
//     for (let i = 0; i < parsedGenerations.length; i++) {
//       const gen = parsedGenerations[i];
//       const existingGen = existingCar.generations[i];

//       // Get existing images for this generation
//       const existingGenImages = existingGen?.images || [];

//       // Get images from frontend (these could be existing URLs or new files)
//       const frontendImages = gen.images || [];

//       // Separate existing URLs from new files
//       const existingImageUrls = frontendImages.filter((img: any) => typeof img === 'string');
//       const newImageFiles = frontendImages.filter((img: any) => img instanceof File);

//       // Also check imagesCount from frontend (alternative way to know new images)
//       const newImagesCount = Number(gen.imagesCount || 0);

//       if (newImageFiles.length > 0 || newImagesCount > 0) {
//         // Mark all old images for deletion (they will be replaced)
//         if (existingGenImages.length > 0) {
//           imagesToDelete.push(...existingGenImages);
//         }

//         // Upload new images
//         const filesToUpload = newImageFiles.length > 0 ? newImageFiles : genFiles.slice(pointer, pointer + newImagesCount);
//         const uploadedUrls = await Promise.all(
//           filesToUpload.map((file: any) =>
//             saveImageLocally(
//               file.buffer || file,
//               "cars/generations",
//               file.originalname || `image-${Date.now()}.jpg`
//             )
//           )
//         );

//         // Combine existing URLs (kept) with new uploaded images
//         // For REPLACE behavior, we should only keep existing URLs that are still selected
//         // and add new ones
//         gen.images = [...existingImageUrls, ...uploadedUrls];
//         pointer += newImageFiles.length;
//       } else {
//         // No new images, keep existing images
//         gen.images = existingImageUrls.length > 0 ? existingImageUrls : existingGenImages;
//       }
//     }

//     // ========== 3. HANDLE DELETED GENERATIONS ==========
//     if (existingCar.generations.length > parsedGenerations.length) {
//       for (let i = parsedGenerations.length; i < existingCar.generations.length; i++) {
//         const extraGen = existingCar.generations[i];
//         if (extraGen?.images && extraGen?.images.length > 0) {
//           imagesToDelete.push(...extraGen?.images);
//         }
//       }
//     }

//     // ========== 4. DELETE MARKED IMAGES ==========
//     const uniqueImagesToDelete = [...new Set(imagesToDelete)];
//     for (const imageUrl of uniqueImagesToDelete) {
//       deleteLocalImage(imageUrl);
//     }

//     // ========== 5. PREPARE UPDATE DATA ==========
//     const updateData: any = {};
//     if (name) updateData.name = name;
//     if (brandObj) updateData.brand = brandObj;
//     if (parsedVariants) updateData.variants = parsedVariants;
//     if (parsedFuelTypes) updateData.fuelTypes = parsedFuelTypes;
//     if (parsedTransmissions) updateData.transmissions = parsedTransmissions;
//     if (parsedGenerations) updateData.generations = parsedGenerations;
//     if (finalBaseImageUrl) updateData.baseImage = finalBaseImageUrl;

//     // ========== 6. UPDATE DATABASE ==========
//     const updated = await CarModel.findByIdAndUpdate(id, updateData, { new: true });
//     if (!updated) {
//       return res.status(404).json({ message: "Car model not found" });
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "Car model updated successfully",
//       model: updated
//     });

//   } catch (error: any) {
//     console.error("updateCarModel error:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

export const updateCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      variants,
      fuelTypes,
      transmissions,
      generations,
      brand,
      brandName,
      brandLogo,
      parentCompany,
      baseImageUrl,
    } = req.body;

    // Find existing car model
    const existingCar = await CarModel.findById(id);
    if (!existingCar) {
      return res.status(404).json({ message: "Car model not found" });
    }

    // Parse brand object
    let brandObj: any = null;
    if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    else if (brandName || brandLogo || parentCompany)
      brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

    // Parse arrays
    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes;
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions;
    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    const files = req.files as any;
    const imagesToDelete: string[] = [];

    // ========== 1. HANDLE BASE IMAGE ==========
    let finalBaseImageUrl = existingCar.baseImage;

    if (files?.baseImage?.[0]) {
      // New base image uploaded - mark old for deletion
      if (existingCar.baseImage) {
        imagesToDelete.push(existingCar.baseImage);
      }
      finalBaseImageUrl = await saveImageLocally(
        files.baseImage[0].buffer,
        "cars/baseImages",
        files.baseImage[0].originalname
      );
    } else if (baseImageUrl) {
      // Using existing base image URL (no change)
      finalBaseImageUrl = baseImageUrl;
    }

    // ========== 2. COLLECT ALL OLD IMAGE URLs FROM EXISTING CAR ==========
    const collectAllOldImages = () => {
      const oldImages: string[] = [];

      // Collect old base image
      if (existingCar.baseImage) {
        oldImages.push(existingCar.baseImage);
      }

      // Collect old generation images
      existingCar.generations?.forEach((gen: any) => {
        if (gen.images && Array.isArray(gen.images)) {
          oldImages.push(...gen.images);
        }
      });

      return oldImages;
    };

    const allOldImages = collectAllOldImages();

    // ========== 3. HANDLE GENERATION IMAGES UPDATE ==========
    const genFiles = files?.generationImages || [];
    let pointer = 0;

    // Process each generation
    for (let i = 0; i < parsedGenerations.length; i++) {
      const gen = parsedGenerations[i];
      const existingGen = existingCar.generations?.[i];

      // Get existing images for this generation
      const existingGenImages = existingGen?.images || [];

      // Get images from frontend (these could be existing URLs only)
      const frontendImages = gen.images || [];

      // Separate existing URLs from frontend
      const existingImageUrls = frontendImages.filter((img: any) => typeof img === 'string');

      // Get the count of new images to add from the frontend payload
      const newImagesCount = Number(gen.imagesCount || 0);

      let uploadedUrls: string[] = [];

      // If there are new images to add, get them from genFiles
      if (newImagesCount > 0 && genFiles.length > 0) {
        // Get the slice of new images for this generation
        const slice = genFiles.slice(pointer, pointer + newImagesCount);

        // Upload the new images
        uploadedUrls = await Promise.all(
          slice.map((file: any) =>
            saveImageLocally(
              file.buffer,
              "cars/generations",
              file.originalname || `image-${Date.now()}.jpg`
            )
          )
        );

        pointer += newImagesCount;
      }

      // Determine which old images to delete
      // Only delete old images if we're adding new ones OR if the user explicitly removed them
      if (uploadedUrls.length > 0) {
        // When adding new images, mark all old images for deletion (replace behavior)
        if (existingGenImages.length > 0) {
          imagesToDelete.push(...existingGenImages);
        }
        // New images = existing kept images + newly uploaded images
        gen.images = [...existingImageUrls, ...uploadedUrls];
      } else {
        // No new images, keep existing images that are still in the list
        // Mark for deletion any existing images that are no longer in frontend list
        const imagesToKeep = existingImageUrls;
        const imagesToRemove = existingGenImages.filter(
          (img: string) => !imagesToKeep.includes(img)
        );
        if (imagesToRemove.length > 0) {
          imagesToDelete.push(...imagesToRemove);
        }
        gen.images = existingImageUrls;
      }
    }

    // ========== 4. HANDLE DELETED GENERATIONS ==========
    if (existingCar.generations?.length > parsedGenerations.length) {
      for (let i = parsedGenerations.length; i < existingCar.generations.length; i++) {
        const extraGen = existingCar.generations[i];
        if (extraGen?.images && extraGen.images.length > 0) {
          imagesToDelete.push(...extraGen.images);
        }
      }
    }

    // ========== 5. COLLECT ALL NEW IMAGE URLs AFTER UPDATE ==========
    const collectNewImages = () => {
      const newImages: string[] = [];

      // Add new base image
      if (finalBaseImageUrl && finalBaseImageUrl.includes('/uploads/')) {
        newImages.push(finalBaseImageUrl);
      }

      // Add new generation images
      parsedGenerations.forEach((gen: any) => {
        if (gen.images && Array.isArray(gen.images)) {
          gen.images.forEach((img: string) => {
            if (img && img.includes('/uploads/')) {
              newImages.push(img);
            }
          });
        }
      });

      return newImages;
    };

    const allNewImages = collectNewImages();

    // ========== 6. FIND AND DELETE ORPHANED IMAGES ==========
    // Images that are in old but not in new should be deleted
    const orphanedImages = allOldImages.filter(oldImg => !allNewImages.includes(oldImg));

    // Also add any images marked for deletion during replacement
    const finalImagesToDelete = [...new Set([...imagesToDelete, ...orphanedImages])];

    console.log("🗑️ Images to delete:", finalImagesToDelete);
    console.log("📁 New images after update:", allNewImages);

    // Delete all marked images
    for (const imageUrl of finalImagesToDelete) {
      if (imageUrl && imageUrl.includes('/uploads/')) {
        deleteLocalImage(imageUrl);
      }
    }

    // ========== 7. PREPARE UPDATE DATA ==========
    const updateData: any = {};
    if (name) updateData.name = name;
    if (brandObj) updateData.brand = brandObj;
    if (parsedVariants) updateData.variants = parsedVariants;
    if (parsedFuelTypes) updateData.fuelTypes = parsedFuelTypes;
    if (parsedTransmissions) updateData.transmissions = parsedTransmissions;
    if (parsedGenerations) updateData.generations = parsedGenerations;
    if (finalBaseImageUrl) updateData.baseImage = finalBaseImageUrl;

    // ========== 8. UPDATE DATABASE ==========
    const updated = await CarModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Car model not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Car model updated successfully",
      model: updated
    });

  } catch (error: any) {
    console.error("updateCarModel error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete car model
 */
export const deleteCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const carModel = await CarModel.findById(id);
    if (!carModel) {
      return res.status(404).json({ message: "Car model not found" });
    }

    // Delete base image
    if (carModel.baseImage) {
      deleteLocalImage(carModel.baseImage);
    }

    // Delete all generation images
    for (const generation of carModel.generations) {
      for (const image of generation.images) {
        deleteLocalImage(image);
      }
    }

    const usedInProduct = await Product.findOne({
      "compatibility.name": carModel.name,
      "compatibility.brand.name": carModel.brand.name,
    });

    if (usedInProduct) {
      return res.status(400).json({
        message: `This car model is used in product "${usedInProduct.name}". Please remove it before deleting.`,
      });
    }

    await CarModel.findByIdAndDelete(id);
    res.json({ status: "success", message: "Car model deleted successfully", carModel });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get all car models
 */

export const getAllCarModels = async (req: Request, res: Response) => {
  try {
    const { q, limit, page } = req.query;

    // Convert pagination params to numbers with defaults
    const limitNum = Number(limit) > 0 ? Number(limit) : 0; // 0 = no limit
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    let query: any = {};

    // If search query is provided, apply regex filters
    if (q && typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q, "i"); // case-insensitive search
      query = {
        $or: [
          { "brand.name": regex },
          { name: regex },
          { transmissions: regex },
          { fuelTypes: regex },
          { variants: regex },
          { "generations.from": regex },
          { "generations.to": regex },
        ],
      };
    }

    // Fetch models based on query + pagination
    const modelsQuery = CarModel.find(query).sort({ name: 1 }).skip(skip);
    if (limitNum > 0) modelsQuery.limit(limitNum);

    const models = await modelsQuery.exec();
    const total = await CarModel.countDocuments(query);

    res.status(200).json({
      status: "success",
      message: q
        ? `Showing results for "${q}"`
        : "All car models fetched successfully",
      total,
      page: pageNum,
      limit: limitNum || "no limit",
      models,
    });
  } catch (error: any) {
    console.error("getAllCarModels error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};


/**
 * Get car model by ID
 */
export const getCarModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carModel = await CarModel.findById(id);
    if (!carModel) {
      return res.status(404).json({ message: "Car model not found" });
    }
    return res.status(200).json({ status: "success", carModel });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

