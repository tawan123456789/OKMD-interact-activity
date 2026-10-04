import type {
  ApiResponse,
  RandomNumberConfig,
  GuessWordConfig,
  GuessPictureConfig,
  NumberCutConfig,
} from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  if (!body.success) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body.data;
}

export const api = {
  getRandomNumber: () =>
    request<RandomNumberConfig>("/api/config/random-number"),
  saveRandomNumber: (config: RandomNumberConfig) =>
    request<RandomNumberConfig>("/api/config/random-number", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  getGuessWord: () => request<GuessWordConfig>("/api/config/guess-word"),
  saveGuessWord: (config: GuessWordConfig) =>
    request<GuessWordConfig>("/api/config/guess-word", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  getGuessPicture: () =>
    request<GuessPictureConfig>("/api/config/guess-picture"),
  saveGuessPicture: (config: GuessPictureConfig) =>
    request<GuessPictureConfig>("/api/config/guess-picture", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  getNumberCut: () => request<NumberCutConfig>("/api/config/number-cut"),
  saveNumberCut: (config: NumberCutConfig) =>
    request<NumberCutConfig>("/api/config/number-cut", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  uploadImage: async (file: File): Promise<{ image: string; filename: string }> => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/images", { method: "POST", body: form });
    const body = (await res.json()) as ApiResponse<{ image: string; filename: string }>;
    if (!body.success) {
      throw new Error(body.error || "Upload failed");
    }
    return body.data;
  },

  deleteImage: async (filename: string): Promise<void> => {
    await fetch(`/api/images/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    });
  },
};
