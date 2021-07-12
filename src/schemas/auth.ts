import Joi from "joi";

export const loginSchema = () => {
  return {
    body: Joi.object({
      googleToken: Joi.string().required(),
    }),
  };
};
