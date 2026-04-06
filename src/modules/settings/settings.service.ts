import Settings from "./settings.model";


export const getSettings = async () => {
  const settings = await Settings.findOne();

  return {
    status: "success",
    data: settings,
  };
};

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
        status: "success",
        message: "Settings updated",
        data: updated,
      };
    }

    const created = await Settings.create(data);

    return {
      status: "success",
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
//     status: "success",
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
    status: "success",
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
    status: "success",
    message: "Settings deleted",
  };
};