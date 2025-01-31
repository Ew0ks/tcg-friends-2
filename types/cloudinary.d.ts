declare module 'cloudinary' {
  export namespace v2 {
    export interface ConfigOptions {
      cloud_name: string;
      api_key: string;
      api_secret: string;
    }

    export interface UploadApiResponse {
      secure_url: string;
      public_id: string;
    }

    export interface UploadApiOptions {
      folder?: string;
      format?: string;
      transformation?: Array<{
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        fetch_format?: string;
      }>;
    }

    export const config: (options: ConfigOptions) => void;
    
    export const uploader: {
      upload(file: string | Buffer, options?: UploadApiOptions): Promise<UploadApiResponse>;
      destroy(publicId: string): Promise<any>;
    };
  }
} 