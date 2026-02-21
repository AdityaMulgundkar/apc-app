import qs from 'qs';
import axios from 'axios';
import { config } from '../config';
import { Model } from '../model';
import { logger } from '../utils/logger';

export class GhlAuth {
  constructor(private model: Model) {}

  async authorizationHandler(code: string): Promise<void> {
    if (!code) {
      logger.warn('No code provided to authorizationHandler');
      return;
    }
    await this.generateAccessTokenRefreshTokenPair(code);
  }

  checkInstallationExists(resourceId: string): boolean {
    return !!this.model.getAccessToken(resourceId);
  }

  async getLocationTokenFromCompanyToken(companyId: string, locationId: string): Promise<void> {
    const axiosInstance = this.createAuthenticatedAxios(companyId);
    const res = await axiosInstance.post(
      '/oauth/locationToken',
      { companyId, locationId },
      { headers: { Version: '2021-07-28' } },
    );
    this.model.saveInstallationInfo(res.data);
  }

  async refreshAccessToken(resourceId: string): Promise<void> {
    try {
      const resp = await axios.post(
        `${config.ghl.apiDomain}/oauth/token`,
        qs.stringify({
          client_id: config.ghl.clientId,
          client_secret: config.ghl.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.model.getRefreshToken(resourceId),
        }),
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
      );
      this.model.setAccessToken(resourceId, resp.data.access_token);
      this.model.setRefreshToken(resourceId, resp.data.refresh_token);
    } catch (error: any) {
      logger.error({ err: error?.response?.data }, 'Failed to refresh access token');
    }
  }

  createAuthenticatedAxios(resourceId: string) {
    if (!this.model.getAccessToken(resourceId)) {
      throw new Error('Installation not found for the following resource');
    }

    const axiosInstance = axios.create({ baseURL: config.ghl.apiDomain });

    axiosInstance.interceptors.request.use(async (requestConfig) => {
      requestConfig.headers['Authorization'] = `Bearer ${this.model.getAccessToken(resourceId)}`;
      return requestConfig;
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.refreshAccessToken(resourceId);
          originalRequest.headers.Authorization = `Bearer ${this.model.getAccessToken(resourceId)}`;
          return axios(originalRequest);
        }
        return Promise.reject(error);
      },
    );

    return axiosInstance;
  }

  private async generateAccessTokenRefreshTokenPair(code: string): Promise<void> {
    try {
      const resp = await axios.post(
        `${config.ghl.apiDomain}/oauth/token`,
        qs.stringify({
          client_id: config.ghl.clientId,
          client_secret: config.ghl.clientSecret,
          grant_type: 'authorization_code',
          code,
        }),
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
      );
      this.model.saveInstallationInfo(resp.data);
    } catch (error: any) {
      logger.error({ err: error?.response?.data }, 'Failed to generate token pair');
    }
  }
}
