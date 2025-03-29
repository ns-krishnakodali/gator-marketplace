import { Categories } from "../../products/models";

export interface ProductImageDTO {
  ID: number;
  Pid: string;
  MimeType: string;
  Url: string;
  IsMain: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ProductDTO {
  ID: number;
  Pid: string;
  Name: string;
  Description: string;
  Price: number;
  Category: Categories;
  Quantity: number;
  PopularityScore: number;
  CreatedAt: string;
  UpdatedAt: string;
  Images: ProductImageDTO[];
}