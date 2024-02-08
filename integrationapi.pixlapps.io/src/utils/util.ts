import { APP } from "./constant";

export const formatSize = (sizeInBytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log2(sizeInBytes) / 10);
  return `${(sizeInBytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export function calculateReductionPercentage(originalSize, optimizedSize) {
  const reductionPercentage =
    ((originalSize - optimizedSize) / originalSize) * 100;

  return `${Number(reductionPercentage.toFixed(2))}%`;
}

export function getServiceType(appid: string) {
  let serviceType = undefined;

  switch (appid) {
    case APP.Image_MANAGEMENT_APP: {
      serviceType = "webflow_images_webp_conversations";
      break;
    }
    case APP.COLLECTION_MANAGEMENT_APP: {
      serviceType = "webflow_collections";
      break;
    }
    default: {
      break;
    }
  }
  return serviceType;
}
