import morgan from 'morgan'
import { Request, Response } from 'express'

morgan.token('post-body', (request: Request, response: Response) => {
  const methodsWithBody = ['POST', 'PUT', 'PATCH']
  if (methodsWithBody.includes(request.method)) {
    return JSON.stringify(request.body)
  }
})

const loggerMiddleware = morgan((tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'),
    '-',
    tokens['response-time'](request, response),
    'ms',
    // tokens['post-body'](request, response),
  ].join(' ')
})

export default loggerMiddleware