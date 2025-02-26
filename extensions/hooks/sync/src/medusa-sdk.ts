import Medusa from "@medusajs/js-sdk"

const SECRET_MEDUSA_API = "sk_6fc351fc0e363437e8f78fd500cd12655a2fdfa6f60bff27c50a33e9241035b7";

export const MedusaSdk = new Medusa({
  baseUrl: "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
  apiKey : SECRET_MEDUSA_API,

})