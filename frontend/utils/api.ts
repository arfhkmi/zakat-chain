import axios, { type AxiosResponse, type AxiosRequestConfig } from "axios";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiParams {
  [key: string]: any;
}

const apiService = {
  async apiCall<T = any>(
    method: HttpMethod,
    endpoint: string,
    params: ApiParams = {}
  ): Promise<AxiosResponse<T>> {
    const baseUrl = import.meta.env.VITE_URL_API || "";
    
    const config: AxiosRequestConfig = {
      withCredentials: true,
    };

    if (method === "GET") {
      config.params = params;
    }

    try {
      let response: AxiosResponse<T>;
      
      if (method === "GET") {
        response = await axios.get<T>(baseUrl + endpoint, config);
      } else if (method === "POST") {
        response = await axios.post<T>(baseUrl + endpoint, params, config);
      } else {
        // Handle other methods as needed
        response = await axios({
          method,
          url: baseUrl + endpoint,
          data: params,
          ...config
        });
      }
      
      return response;
    } catch (err) {
      console.error(`API Error (${method} ${endpoint}):`, err);
      throw err;
    }
  }
};

export default apiService;
