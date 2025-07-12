declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_BACKEND_URL: string
    NEXT_PUBLIC_API_URL: string
    NEXT_PUBLIC_API_VERSION: string
    NEXT_PUBLIC_GOOGLE_API_KEY: string
    NEXT_PUBLIC_G_MAPS_API_URL: string
    API_URI: string
    NEXT_PUBLIC_APP_URL: string
    PORT: string
    HOST: string
  }
}