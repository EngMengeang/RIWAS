import Joi from "joi"
import { JOB_TYPE } from "../config/constants.js"
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))
      return res.status(400).json({ errors: messages })
    }

    req.validatedData = value
    next()
  }
}

// Define schemas
export const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid("recruiter", "candidate"),
})

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const createPostSchema = Joi.object({
  content: Joi.string().required().max(5000),
  image: Joi.string().uri().optional(),
})

export const createJobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),

  jobType: Joi.string()
    .valid(...Object.values(JOB_TYPE))
    .required(),

  requirements: Joi.array().items(Joi.string()).optional(),

  salary: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    currency: Joi.string().optional(),
  }).optional(),
})

export const updateJobSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  location: Joi.string().optional(),

  status: Joi.string()
    .valid("draft", "published", "closed")
    .optional(),

  jobType: Joi.string()
    .valid(...Object.values(JOB_TYPE))
    .optional(),

  applicationDeadline: Joi.date().iso().optional(),

  requirements: Joi.array().items(Joi.string()).optional(),

  salary: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    currency: Joi.string().optional(),
  }).optional(),
}).min(1)
