// client/src/utils/notifications.js
import { toast } from 'react-toastify';

export const notifySuccess = (message) => {
  toast.success(message, {
    // You can customize options per toast type if needed
  });
};

export const notifyError = (message) => {
  toast.error(message);
};

export const notifyInfo = (message) => {
  toast.info(message);
};

export const notifyWarning = (message) => {
  toast.warn(message);
};