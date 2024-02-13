// Why define it here?
// The code did not use env vars and used static urls. So for simplicity I used it here again so the code will not change.

export const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL;
export const ITEM_SERVICE_URL = import.meta.env.VITE_ITEM_SERVICE_URL;
export const CART_SERVICE_URL = import.meta.env.VITE_CART_SERVICE_URL;
export const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL;
export const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL;