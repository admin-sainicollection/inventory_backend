import { Request, Response } from "express";
import { createOrUpdateSettings, getSettings, updateSettings } from "./settings.service";
import { deleteFile } from "../../utils/deleteFile";
import Settings from "./settings.model";


// export const saveSettings = async (req: Request, res: Response) => {
//   try {
//     const result = await createOrUpdateSettings(req.body);

//     res.status(200).json(result);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };


export const fetchSettings = async (req: Request, res: Response) => {
  try {
    const result = await getSettings();

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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



// ================= SAVE =================
export const saveSettings = async (req: any, res: Response) => {
  try {
    const files = req.files;

    const parsedBody = {
      ...req.body,
      contact: parseJSON(req.body.contact, {}),
      address: parseJSON(req.body.address, []),
      bankDetails: parseJSON(req.body.bankDetails, []),
      owner: parseJSON(req.body.owner, {}),
      documents: parseJSON(req.body.documents, {}),
      businessType: parseJSON(req.body.businessType, []),
    };

    const existing = await Settings.findOne(); // ✅ ADD THIS

    const data = {
      ...parsedBody,

      businessLogo: files?.businessLogo?.[0]?.path
        ? getRelativePath(files.businessLogo[0].path)
        : existing?.businessLogo,

      owner: {
        ...parsedBody.owner,
        signature: files?.signature?.[0]?.path
          ? getRelativePath(files.signature[0].path)
          : existing?.owner?.signature
      },

      documents: {
        aadhar: {
          ...parsedBody.documents?.aadhar,
          aadharPhoto: files?.aadharPhoto?.[0]?.path
            ? getRelativePath(files.aadharPhoto[0].path)
            : existing?.documents?.aadhar?.aadharPhoto
        },
        pan: {
          ...parsedBody.documents?.pan,
          panPhoto: files?.panPhoto?.[0]?.path
            ? getRelativePath(files.panPhoto[0].path)
            : existing?.documents?.pan?.panPhoto
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
      status: "success",
      message: existing ? "updated" : "created",
      data: result
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
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
      owner: parseJSON(req.body.owner, {}),
      documents: parseJSON(req.body.documents, {}),
      businessType: parseJSON(req.body.businessType, []),
    };

    const data = {
      ...parsedBody,

      businessLogo: files?.businessLogo?.[0]?.path
        ? getRelativePath(files.businessLogo[0].path)
        : existing.businessLogo,

      owner: {
        ...parsedBody.owner,
        signature: files?.signature?.[0]?.path
          ? getRelativePath(files.signature[0].path)
          : existing.owner?.signature
      },

      documents: {
        aadhar: {
          ...parsedBody.documents?.aadhar,
          aadharPhoto: files?.aadharPhoto?.[0]?.path
            ? getRelativePath(files.aadharPhoto[0].path)
            : existing.documents?.aadhar?.aadharPhoto
        },
        pan: {
          ...parsedBody.documents?.pan,
          panPhoto: files?.panPhoto?.[0]?.path
            ? getRelativePath(files.panPhoto[0].path)
            : existing.documents?.pan?.panPhoto
        }
      }
    };

    // 🔥 DELETE OLD FILES
    if (files?.businessLogo && existing.businessLogo) deleteFile(existing.businessLogo);
    if (files?.signature && existing.owner?.signature) deleteFile(existing.owner.signature);
    if (files?.aadharPhoto && existing.documents?.aadhar?.aadharPhoto) deleteFile(existing.documents.aadhar.aadharPhoto);
    if (files?.panPhoto && existing.documents?.pan?.panPhoto) deleteFile(existing.documents.pan.panPhoto);

    const updated = await Settings.findByIdAndUpdate(existing._id, data, { new: true });

    res.status(200).json({
      status: "success",
      message: "updated",
      data: updated
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};