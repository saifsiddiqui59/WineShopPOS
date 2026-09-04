import { supabase } from "./supabase";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function productImageUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

function validateImage(file) {
  if (!file) throw new Error("Choose an image first.");
  if (!EXTENSION_BY_TYPE[file.type]) {
    throw new Error("Use a JPEG, PNG or WebP product image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Product image must be 5 MB or smaller.");
  }
}

export async function uploadProductImage({
  shopId,
  productId,
  file,
  previousPath = "",
}) {
  validateImage(file);
  if (!shopId || !productId) {
    throw new Error("Shop and product are required before image upload.");
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  const path = `${shopId}/${productId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { error: linkError } = await supabase.rpc("set_product_image", {
    p_product_id: productId,
    p_image_path: path,
  });

  if (linkError) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
    throw linkError;
  }

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(BUCKET).remove([previousPath]).catch(() => {});
  }

  return { path, url: productImageUrl(path) };
}

export async function removeProductImage(productId, imagePath) {
  const { error } = await supabase.rpc("set_product_image", {
    p_product_id: productId,
    p_image_path: null,
  });
  if (error) throw error;

  if (imagePath) {
    await supabase.storage.from(BUCKET).remove([imagePath]).catch(() => {});
  }
}
