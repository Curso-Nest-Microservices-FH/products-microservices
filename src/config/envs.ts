import 'dotenv/config'
import * as joi from 'joi'

// Joi se usa para hacer validaciones de las variables de entorno

interface EnvVars {
    PORT: number
    DATABASE_URL: string
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required()
})

.unknown(true) // permite evadir las validaciones a todas las otras variables de entorno

const {error, value} = envsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
    
}

const envVars: EnvVars = value

export const envs = {
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
}