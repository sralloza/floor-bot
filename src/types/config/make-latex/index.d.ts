declare module "make-latex" {
  /**
   * latex(): main function to turn JS objects into LaTeX tables
   * @param{Object} input - object to be displayed in table
   * @param{Object} options - options object governing outputted TeX code
   */
  export default function latex(
    input: any,
    options?: import("convert-obj").ConvertOptions
  ): string;
}
