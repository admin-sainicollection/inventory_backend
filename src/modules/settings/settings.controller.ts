import { Request, Response } from "express";
import { createOrUpdateSettings, getSettings, updateSettings } from "./settings.service";

export const saveSettings = async (req: Request, res: Response) => {
  try {
    const result = await createOrUpdateSettings(req.body);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchSettings = async (req: Request, res: Response) => {
  try {
    const result = await getSettings();

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettingsController = async (req: Request, res: Response) => {
  try {
    const result = await updateSettings(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};