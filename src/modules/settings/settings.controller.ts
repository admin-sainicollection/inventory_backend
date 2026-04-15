import { Request, Response } from "express";
import { getBankInfo, getBusinessInfo, getSettings, getSignature, getTaxInfo } from "./settings.service";
import Settings from "./settings.model";
import { saveImageLocally } from "../../utils/fileUploadHelper";
import { deleteMultipleImages } from "../../utils/fileDeleteHelper";


export const fetchSettings = async (req: Request, res: Response) => {
  try {
    const result = await getSettings();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchBusinessInfo = async (req: Request, res: Response) => {
  try {
    const result = await getBusinessInfo();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchTaxInfo = async (req: Request, res: Response) => {
  try {
    const result = await getTaxInfo();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchBankInfo = async (req: Request, res: Response) => {
  try {
    const result = await getBankInfo();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchSignature = async (req: Request, res: Response) => {
  try {
    const result = await getSignature();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRelativePath = (filePath: string) => {
  const index = filePath.indexOf("uploads");
  return "/" + filePath.substring(index).replace(/\\/g, "/");
};
const parseJSON = (val: any, def: any) => {
  try {
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
};



export const saveSettings = async (req: any, res: Response) => {
  try {
    const files = req.files;

    const parsedBody = {
      ...req.body,
      contact: parseJSON(req.body.contact, {}),
      address: parseJSON(req.body.address, []),
      bankDetails: parseJSON(req.body.bankDetails, []),
      taxDetails: parseJSON(req.body.taxDetails, []),
      owner: parseJSON(req.body.owner, {}),
      documents: parseJSON(req.body.documents, {}),
      businessType: parseJSON(req.body.businessType, []),
    };

    const existing = await Settings.findOne();

    // Save business logo locally
    let businessLogoUrl = existing?.businessLogo;
    if (files?.businessLogo?.[0]) {
      businessLogoUrl = await saveImageLocally(
        files.businessLogo[0].buffer,
        "settings/businessLogo",
        files.businessLogo[0].originalname
      );
    }

    // Save signature locally
    let signatureUrl = existing?.owner?.signature;
    if (files?.signature?.[0]) {
      signatureUrl = await saveImageLocally(
        files.signature[0].buffer,
        "settings/signature",
        files.signature[0].originalname
      );
    }

    // Save Aadhaar front
    let aadharFrontUrl = existing?.documents?.aadhar?.front;
    if (files?.aadharFront?.[0]) {
      aadharFrontUrl = await saveImageLocally(
        files.aadharFront[0].buffer,
        "settings/documents/aadhar",
        files.aadharFront[0].originalname
      );
    }

    // Save Aadhaar back
    let aadharBackUrl = existing?.documents?.aadhar?.back;
    if (files?.aadharBack?.[0]) {
      aadharBackUrl = await saveImageLocally(
        files.aadharBack[0].buffer,
        "settings/documents/aadhar",
        files.aadharBack[0].originalname
      );
    }

    // Save PAN photo
    let panPhotoUrl = existing?.documents?.pan?.panPhoto;
    if (files?.panPhoto?.[0]) {
      panPhotoUrl = await saveImageLocally(
        files.panPhoto[0].buffer,
        "settings/documents/pan",
        files.panPhoto[0].originalname
      );
    }

    const data = {
      ...parsedBody,
      businessLogo: businessLogoUrl,
      owner: {
        ...parsedBody.owner,
        signature: signatureUrl
      },
      documents: {
        aadhar: {
          ...parsedBody.documents?.aadhar,
          front: aadharFrontUrl,
          back: aadharBackUrl
        },
        pan: {
          ...parsedBody.documents?.pan,
          panPhoto: panPhotoUrl
        }
      }
    };

    let result;

    if (existing) {
      result = await Settings.findByIdAndUpdate(existing._id, data, { new: true });
    } else {
      result = await Settings.create(data);
    }

    res.status(200).json({
      success: true,
      message: existing ? "Settings updated successfully" : "Settings created successfully",
      data: result
    });

  } catch (err: any) {
    console.error("Save settings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE =================
export const updateSettingsController = async (req: any, res: Response) => {
  try {
    const files = req.files;

    const existing = await Settings.findOne();
    if (!existing) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const parsedBody = {
      ...req.body,
      contact: parseJSON(req.body.contact, {}),
      address: parseJSON(req.body.address, []),
      bankDetails: parseJSON(req.body.bankDetails, []),
      taxDetails: parseJSON(req.body.taxDetails, []),
      owner: parseJSON(req.body.owner, {}),
      documents: parseJSON(req.body.documents, {}),
      businessType: parseJSON(req.body.businessType, []),
    };

    // Track images to delete (old ones that will be replaced)
    const imagesToDelete: string[] = [];

    // Handle Business Logo
    let businessLogoUrl = existing.businessLogo;
    if (files?.businessLogo?.[0]) {
      if (existing.businessLogo) {
        imagesToDelete.push(existing.businessLogo);
      }
      businessLogoUrl = await saveImageLocally(
        files.businessLogo[0].buffer,
        "settings/businessLogo",
        files.businessLogo[0].originalname
      );
    }

    // Handle Signature
    let signatureUrl = existing.owner?.signature;
    if (files?.signature?.[0]) {
      if (existing.owner?.signature) {
        imagesToDelete.push(existing.owner.signature);
      }
      signatureUrl = await saveImageLocally(
        files.signature[0].buffer,
        "settings/signature",
        files.signature[0].originalname
      );
    }

    // Handle Aadhaar Front
    let aadharFrontUrl = existing.documents?.aadhar?.front;
    if (files?.aadharFront?.[0]) {
      if (existing.documents?.aadhar?.front) {
        imagesToDelete.push(existing.documents.aadhar.front);
      }
      aadharFrontUrl = await saveImageLocally(
        files.aadharFront[0].buffer,
        "settings/documents/aadhar",
        files.aadharFront[0].originalname
      );
    }

    // Handle Aadhaar Back
    let aadharBackUrl = existing.documents?.aadhar?.back;
    if (files?.aadharBack?.[0]) {
      if (existing.documents?.aadhar?.back) {
        imagesToDelete.push(existing.documents.aadhar.back);
      }
      aadharBackUrl = await saveImageLocally(
        files.aadharBack[0].buffer,
        "settings/documents/aadhar",
        files.aadharBack[0].originalname
      );
    }

    // Handle PAN Photo
    let panPhotoUrl = existing.documents?.pan?.panPhoto;
    if (files?.panPhoto?.[0]) {
      if (existing.documents?.pan?.panPhoto) {
        imagesToDelete.push(existing.documents.pan.panPhoto);
      }
      panPhotoUrl = await saveImageLocally(
        files.panPhoto[0].buffer,
        "settings/documents/pan",
        files.panPhoto[0].originalname
      );
    }

    // Handle removal of images from frontend (if fields become empty)
    // Check if business logo was removed
    if (parsedBody.businessLogo === "" || parsedBody.businessLogo === null) {
      if (existing.businessLogo) {
        imagesToDelete.push(existing.businessLogo);
      }
      businessLogoUrl = undefined;
    }

    // Check if signature was removed
    if (parsedBody.owner?.signature === "" || parsedBody.owner?.signature === null) {
      if (existing.owner?.signature) {
        imagesToDelete.push(existing.owner.signature);
      }
      signatureUrl = undefined;
    }

    // Check if Aadhaar front was removed
    if (parsedBody.documents?.aadhar?.front === "" || parsedBody.documents?.aadhar?.front === null) {
      if (existing.documents?.aadhar?.front) {
        imagesToDelete.push(existing.documents.aadhar.front);
      }
      aadharFrontUrl = undefined;
    }

    // Check if Aadhaar back was removed
    if (parsedBody.documents?.aadhar?.back === "" || parsedBody.documents?.aadhar?.back === null) {
      if (existing.documents?.aadhar?.back) {
        imagesToDelete.push(existing.documents.aadhar.back);
      }
      aadharBackUrl = undefined;
    }

    // Check if PAN photo was removed
    if (parsedBody.documents?.pan?.panPhoto === "" || parsedBody.documents?.pan?.panPhoto === null) {
      if (existing.documents?.pan?.panPhoto) {
        imagesToDelete.push(existing.documents.pan.panPhoto);
      }
      panPhotoUrl = undefined;
    }

    // Delete all old images
    if (imagesToDelete.length > 0) {
      deleteMultipleImages(imagesToDelete);
    }

    const data = {
      ...parsedBody,
      businessLogo: businessLogoUrl,
      owner: {
        ...parsedBody.owner,
        signature: signatureUrl
      },
      documents: {
        aadhar: {
          ...parsedBody.documents?.aadhar,
          front: aadharFrontUrl,
          back: aadharBackUrl
        },
        pan: {
          ...parsedBody.documents?.pan,
          panPhoto: panPhotoUrl
        }
      }
    };

    const updated = await Settings.findByIdAndUpdate(existing._id, data, { new: true });

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: updated
    });

  } catch (err: any) {
    console.error("Update settings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DELETE SETTINGS (with image cleanup) =================
export const deleteSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }

    // Collect all images to delete
    const imagesToDelete: string[] = [];

    if (settings.businessLogo) imagesToDelete.push(settings.businessLogo);
    if (settings.owner?.signature) imagesToDelete.push(settings.owner.signature);
    if (settings.documents?.aadhar?.front) imagesToDelete.push(settings.documents.aadhar.front);
    if (settings.documents?.aadhar?.back) imagesToDelete.push(settings.documents.aadhar.back);
    if (settings.documents?.pan?.panPhoto) imagesToDelete.push(settings.documents.pan.panPhoto);

    // Delete all images from local storage
    if (imagesToDelete.length > 0) {
      deleteMultipleImages(imagesToDelete);
    }

    // Delete settings from database
    await Settings.findByIdAndDelete(settings._id);

    res.status(200).json({
      success: true,
      message: "Settings deleted successfully"
    });

  } catch (err: any) {
    console.error("Delete settings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CLEAR UPLOADS (if needed) =================
export const clearUploads = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      const imagesToDelete: string[] = [];

      if (settings.businessLogo) imagesToDelete.push(settings.businessLogo);
      if (settings.owner?.signature) imagesToDelete.push(settings.owner.signature);
      if (settings.documents?.aadhar?.front) imagesToDelete.push(settings.documents.aadhar.front);
      if (settings.documents?.aadhar?.back) imagesToDelete.push(settings.documents.aadhar.back);
      if (settings.documents?.pan?.panPhoto) imagesToDelete.push(settings.documents.pan.panPhoto);

      deleteMultipleImages(imagesToDelete);

      // Clear image fields in database
      await Settings.findByIdAndUpdate(settings._id, {
        $unset: {
          businessLogo: "",
          "owner.signature": "",
          "documents.aadhar.front": "",
          "documents.aadhar.back": "",
          "documents.pan.panPhoto": ""
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "All uploads cleared successfully"
    });
  } catch (err: any) {
    console.error("Clear uploads error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};