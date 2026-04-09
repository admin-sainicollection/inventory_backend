import Settings from "./settings.model";


export const getSettings = async () => {
  const settings = await Settings.findOne();

  return {
    success: true,
    message: "Setting details fetch successfully",
    data: settings,
  };
};

export const getBusinessInfo = async () => {
  const settings = await Settings.findOne().select({
    businessName: 1,
    businessLogo: 1,
    businessType: 1,
    description: 1,
    contact:1,
    address:1
  });

  return {
    success: true,
    message: "Business info fetched successfully",
    data: settings,
  };
}

export const getTaxInfo = async () => {
  const settings = await Settings.findOne().select({
    taxDetails: 1,
  });

  return {
    success: true,
    message: "Tax details fetched successfully",
    data: settings || [],
  };
}

export const getBankInfo = async () => {
  const settings = await Settings.findOne().select({
    bankDetails: 1,
  });

  return {
    success: true,
    message: "Bank details fetched successfully",
    data: settings?.bankDetails || [],
  };
}

export const getSignature = async () => {
  const settings = await Settings.findOne().select({
    'owner.signature': 1,
  });

  return {
    success: true,
    message: "Signature fetched successfully",
    data: settings?.owner || null,
  };
}

export const createOrUpdateSettings = async (data: any) => {
  try {
    const existing = await Settings.findOne();

    if (existing) {
      const updated = await Settings.findByIdAndUpdate(
        existing._id,
        data,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        message: "Settings updated",
        data: updated,
      };
    }

    const created = await Settings.create(data);

    return {
      success: true,
      message: "Settings created",
      data: created,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// export const updateSettings = async (data: any) => {
//   const existing = await Settings.findOne();
//   if (!existing) {
//     throw new Error("Settings not found");
//   }
//   const updated = await Settings.findByIdAndUpdate(
//     existing._id,
//     data,
//     { new: true, runValidators: true }
//   );
//   return {
//     success:true,
//     message: "Settings updated",
//     data: updated,
//   };
// };

export const updateSettings = async (data: any) => {
  const updated = await Settings.findOneAndUpdate(
    {},
    data,
    { new: true, upsert: false, runValidators: true }
  );

  if (!updated) {
    throw new Error("Settings not found");
  }

  return {
    success: true,
    message: "Settings updated",
    data: updated,
  };
};



export const deleteSettings = async () => {
  const existing = await Settings.findOne();
  if (!existing) {
    throw new Error("Settings not found");
  }
  await Settings.findByIdAndDelete(existing._id);
  return {
    success: true,
    message: "Settings deleted",
  };
};