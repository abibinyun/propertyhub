import { PORTS } from '@propertyhub/shared';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || `http://localhost:${PORTS.API_DEFAULT}`;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORTS.WEB_DEFAULT}`;

export const BASE_URL = APP_URL;
