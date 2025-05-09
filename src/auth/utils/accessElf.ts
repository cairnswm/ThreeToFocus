let accessElfApikey: string = "";
const accessElfTrackerUrl: string = "https://accesself.co.za/php/api/track.php";

export const setApiKey = (key: string): void => {
  console.log("Setting new APIKey", key);
  accessElfApikey = key;
};

const accessElfDebounceMap: Map<string, NodeJS.Timeout> = new Map();

interface TrackingPayload {
  page?: string;
  id?: string;
  error?: string;
}

const sendAccessElfTracking = (page?: string, id?: string, message?: string): void => {
  if (!accessElfApikey) { 
    // console.log("No API key set for AccessElf");
    return; 
  }
  const key = (page ?? "") + "-" + (id ?? "") + "-" + (message ?? "");
  const payload: TrackingPayload = { page, id };
  if (message) {
    payload.error = message;
  }

  if (accessElfDebounceMap.has(key)) {
    clearTimeout(accessElfDebounceMap.get(key)!);
  }

  accessElfDebounceMap.set(key, setTimeout(() => {
    fetch(accessElfTrackerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: accessElfApikey,
      },
      body: JSON.stringify(payload),
    });
    accessElfDebounceMap.delete(key);
  }, 800));
};

export const track = (page?: string, id?: string): void => {
  sendAccessElfTracking(page, id);
};

export const error = (page?: string, id?: string, message?: string): void => {
  sendAccessElfTracking(page, id, message);
};

export const accessElf = {
  track,
  error,
  setApiKey,
  get apiKey(): string {
    return accessElfApikey;
  },
};
