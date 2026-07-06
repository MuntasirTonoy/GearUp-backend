export interface IUploadedImage {
  url: string;
  publicId: string;
}

export interface IUploadResponse {
  images: IUploadedImage[];
}

export interface ISingleUploadResponse {
  image: IUploadedImage;
}
