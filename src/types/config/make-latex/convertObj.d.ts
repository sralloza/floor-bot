declare module "convert-obj" {
  export interface ConvertOptions {
    pos?: string;
    colnames?: string;
    digits?: number;
    caption?: string;
    captionPlacement?: "bottom" | "top";
    label?: string;
    spec?: "l" | "c" | "r";
  }

  export default function convertObj(obj: any, options: ConvertOptions): string;
}
