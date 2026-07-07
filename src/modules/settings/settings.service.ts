import { prisma } from "../../lib/prisma";

const getSettings = async () => {
  const p = prisma as any;
  let settings = await p.platformSettings.findFirst();
  if (!settings) {
    settings = await p.platformSettings.create({
      data: {
        platformFeeRate: 10.0,
      },
    });
  }
  return settings;
};

const updateSettings = async (data: { platformFeeRate: number }) => {
  const p = prisma as any;
  let settings = await p.platformSettings.findFirst();
  if (!settings) {
    settings = await p.platformSettings.create({
      data,
    });
  } else {
    settings = await p.platformSettings.update({
      where: { id: settings.id },
      data,
    });
  }
  return settings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};
