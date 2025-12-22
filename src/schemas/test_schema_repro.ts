
import { z } from "zod";

const CountySchema = z.object({
  id: z.number(),
  name: z.string(),
});

const MemberProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  gender: z.string().nullable(),
  county_id: z.number().nullable(),
  sub_county: z.string().nullable(),
  ward: z.string().nullable(),
  interests: z.array(z.string()).nullable(),
  bio: z.string().nullable(),
  is_staff: z.boolean().default(false),
  membership_type: z.number().nullable().optional(),
  plan_id: z.number().nullable().optional(),
  plan_type: z.string().nullable().optional(),
  plan_expires_at: z.string().nullable().optional(),
  occupation: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  terms_accepted: z.boolean().default(false),
  marketing_consent: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
  county: CountySchema.optional(),
  subscription_plan: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    price: z.number(),
  }).optional(),
  user: z
    .object({
      id: z.number(),
      username: z.string(),
      email: z.string(),
      email_verified_at: z.string().nullable(),
      profile_picture_url: z.string().nullable().optional(),
    })
    .optional(),
});

const jsonData = {
"id": 1,
"user_id": 1,
"first_name": "Super",
"last_name": "Admin",
"phone_number": null,
"date_of_birth": null,
"gender": null,
"county_id": 1,
"sub_county": null,
"ward": null,
"interests": null,
"bio": null,
"is_staff": true,
"plan_id": 1,
"plan_type": "free",
"plan_expires_at": null,
"occupation": null,
"emergency_contact_name": null,
"emergency_contact_phone": null,
"terms_accepted": true,
"marketing_consent": false,
"created_at": "2025-12-18 06:21:18",
"updated_at": "2025-12-18 06:21:18",
"deleted_at": null,
"user": {
"id": 1,
"name": null,
"username": "superadmin",
"email": "superadmin@dadisilab.com",
"phone": null,
"email_verified_at": "2025-12-18 06:21:18",
"profile_picture_url": null
},
"county": {
"id": 1,
"name": "Mombasa"
},
"subscription_plan": {
"id": 1,
"name": "{\"en\":\"Free\"}",
"slug": "free",
"description": "{\"en\":\"Free Plan\"}",
"price": 0
}
};

try {
  MemberProfileSchema.parse(jsonData);
  console.log("Validation Successful!");
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error("Validation Failed:");
    console.error(JSON.stringify(e.errors, null, 2));
  } else {
    console.error(e);
  }
}
