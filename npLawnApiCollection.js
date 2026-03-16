// NP Lawn API Collection
// Based on the NP02 codebase — Supabase REST API v1
// Base URL: https://gbxnofjprrrjqqbseivhe.supabase.co/rest/v1
//
// Authentication:
//   Public endpoints: add header  apikey: <anon-key>
//   Protected endpoints: add headers  apikey: <anon-key>  +  Authorization: Bearer <access-token>

const NP_LAWN_API_COLLECTION = {
  info: {
    name: "NP Lawn API",
    description: "REST API for the NP Lawn marketplace — covers authentication, properties, quotes, jobs, messaging, provider management, and more.",
    baseUrl: "https://gbxnofjprrrjqqbseivhe.supabase.co/rest/v1"
  },
  auth: {
    type: "apikey",
    headerName: "apikey"
  },
  endpoints: [

    // ── AUTHENTICATION ────────────────────────────────────────────────────────

    {
      id: "auth-signup",
      folder: "Authentication",
      name: "Sign Up",
      method: "POST",
      path: "/users",
      description: "Register a new user. Role must be 'user', 'provider', or 'admin'. Password is hashed client-side with SHA-256 before submission.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: false,
      body: {
        id: "usr_abc123xyz",
        email: "jane.smith@example.com",
        password_hash: "ef92b778bafe771207e04b...sha256hash",
        name: "Jane Smith",
        role: "user"
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "usr_abc123xyz",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          role: "user",
          created_at: "2026-03-15T10:30:00Z"
        }]
      }
    },

    {
      id: "auth-signin",
      folder: "Authentication",
      name: "Sign In",
      method: "GET",
      path: "/users?email=eq.{email}&select=id,email,name,role,password_hash",
      description: "Retrieve a user record by email, then compare the SHA-256 hash client-side to authenticate. Returns the user object on match.",
      requiresAuth: false,
      pathParams: [
        { key: "email", value: "jane.smith@example.com", description: "The user's email address (URL-encoded)" }
      ],
      sampleResponse: {
        status: 200,
        body: [{
          id: "usr_abc123xyz",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          role: "user"
        }]
      }
    },

    // ── USER PROFILES ─────────────────────────────────────────────────────────

    {
      id: "profile-get",
      folder: "User Profiles",
      name: "Get Profile",
      method: "GET",
      path: "/profiles?id=eq.{userId}",
      description: "Fetch a user's profile. Users can only read their own profile (enforced via Supabase RLS).",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The authenticated user's ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [{
          id: "usr_abc123xyz",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          role: "user",
          phone: "615-555-0100",
          created_at: "2026-03-15T10:30:00Z"
        }]
      }
    },

    {
      id: "profile-update",
      folder: "User Profiles",
      name: "Update Profile",
      method: "PATCH",
      path: "/profiles?id=eq.{userId}",
      description: "Update the authenticated user's profile fields.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The authenticated user's ID" }
      ],
      body: {
        name: "Jane Smith",
        phone: "615-555-0199"
      },
      sampleResponse: {
        status: 200,
        body: [{
          id: "usr_abc123xyz",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          phone: "615-555-0199",
          role: "user"
        }]
      }
    },

    // ── PROPERTIES ────────────────────────────────────────────────────────────

    {
      id: "properties-list",
      folder: "Properties",
      name: "List Properties",
      method: "GET",
      path: "/homeowner_properties?homeowner_id=eq.{userId}&order=is_primary.desc",
      description: "List all properties for the authenticated homeowner, primary property first.",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The homeowner's user ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "prop_001",
            homeowner_id: "usr_abc123xyz",
            nickname: "Home",
            address: "123 Main St",
            city: "Nolensville",
            state: "TN",
            zip: "37135",
            lot_size_sqft: 8500,
            is_primary: true,
            notes: null
          }
        ]
      }
    },

    {
      id: "properties-create",
      folder: "Properties",
      name: "Create Property",
      method: "POST",
      path: "/homeowner_properties",
      description: "Add a new property for the homeowner.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      body: {
        homeowner_id: "usr_abc123xyz",
        nickname: "Rental House",
        address: "456 Oak Ave",
        city: "Nolensville",
        state: "TN",
        zip: "37135",
        lot_size_sqft: 6200,
        is_primary: false,
        notes: "Back gate code: 5678"
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "prop_002",
          homeowner_id: "usr_abc123xyz",
          nickname: "Rental House",
          address: "456 Oak Ave",
          city: "Nolensville",
          state: "TN",
          zip: "37135",
          lot_size_sqft: 6200,
          is_primary: false,
          notes: "Back gate code: 5678"
        }]
      }
    },

    {
      id: "properties-update",
      folder: "Properties",
      name: "Update Property",
      method: "PATCH",
      path: "/homeowner_properties?id=eq.{propertyId}",
      description: "Update details for an existing property.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "propertyId", value: "prop_002", description: "The property ID to update" }
      ],
      body: {
        nickname: "Rental House",
        lot_size_sqft: 6500,
        notes: "Front gate code: 1234"
      },
      sampleResponse: {
        status: 200,
        body: [{ id: "prop_002", nickname: "Rental House", lot_size_sqft: 6500, notes: "Front gate code: 1234" }]
      }
    },

    {
      id: "properties-delete",
      folder: "Properties",
      name: "Delete Property",
      method: "DELETE",
      path: "/homeowner_properties?id=eq.{propertyId}",
      description: "Permanently delete a property. Cannot delete the primary property while others exist.",
      requiresAuth: true,
      pathParams: [
        { key: "propertyId", value: "prop_002", description: "The property ID to delete" }
      ],
      sampleResponse: {
        status: 204,
        body: null
      }
    },

    {
      id: "properties-set-primary",
      folder: "Properties",
      name: "Set Primary Property",
      method: "PATCH",
      path: "/homeowner_properties?homeowner_id=eq.{userId}",
      description: "Set a property as primary. First clears is_primary on all properties for the homeowner, then sets it on the chosen one (two-step operation).",
      headers: [
        { key: "Content-Type", value: "application/json" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The homeowner's user ID" }
      ],
      body: {
        is_primary: false
      },
      sampleResponse: {
        status: 204,
        body: null
      }
    },

    // ── QUOTE REQUESTS (HOMEOWNER) ────────────────────────────────────────────

    {
      id: "quote-requests-create",
      folder: "Quote Requests",
      name: "Create Quote Request",
      method: "POST",
      path: "/quote_requests",
      description: "Submit a new service quote request. Providers matching the property's ZIP code will be able to see and respond to this request.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      body: {
        homeowner_id: "usr_abc123xyz",
        property_id: "prop_001",
        service_types: ["lawn_mowing", "edging"],
        description: "Backyard needs special attention around the garden beds.",
        lot_size: 8500,
        terrain: "flat",
        obstacles: "Garden beds, swing set",
        preferred_date: "2026-03-22",
        preferred_time_window: "morning",
        schedule_type: "recurring",
        recurrence_frequency: "biweekly",
        special_instructions: "Gate code is 1234",
        status: "pending"
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "qreq_789def",
          homeowner_id: "usr_abc123xyz",
          property_id: "prop_001",
          service_types: ["lawn_mowing", "edging"],
          status: "pending",
          created_at: "2026-03-15T11:00:00Z"
        }]
      }
    },

    {
      id: "quote-requests-list",
      folder: "Quote Requests",
      name: "List Quote Requests",
      method: "GET",
      path: "/quote_requests?homeowner_id=eq.{userId}&order=created_at.desc",
      description: "Retrieve all quote requests submitted by the authenticated homeowner.",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The homeowner's user ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "qreq_789def",
            service_types: ["lawn_mowing", "edging"],
            status: "pending",
            preferred_date: "2026-03-22",
            schedule_type: "recurring",
            recurrence_frequency: "biweekly",
            created_at: "2026-03-15T11:00:00Z"
          }
        ]
      }
    },

    // ── QUOTES (HOMEOWNER VIEW) ───────────────────────────────────────────────

    {
      id: "quotes-list",
      folder: "Quotes",
      name: "List Quotes for Request",
      method: "GET",
      path: "/quotes?request_id=in.({requestIds})&order=amount.asc",
      description: "List all provider quotes submitted for one or more quote requests, sorted cheapest first.",
      requiresAuth: true,
      pathParams: [
        { key: "requestIds", value: "qreq_789def,qreq_111ghi", description: "Comma-separated quote request IDs" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "qt_001",
            request_id: "qreq_789def",
            provider_email: "provider@greenlawn.com",
            amount: 65.00,
            amount_min: null,
            amount_max: null,
            duration_days: 1,
            validity_days: 7,
            notes: "Includes cleanup.",
            status: "pending"
          }
        ]
      }
    },

    {
      id: "quotes-accept",
      folder: "Quotes",
      name: "Accept Quote",
      method: "PATCH",
      path: "/quotes?id=eq.{quoteId}",
      description: "Accept a provider's quote. Also updates the parent quote_request status to 'accepted'.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "quoteId", value: "qt_001", description: "The quote ID to accept" }
      ],
      body: { status: "accepted" },
      sampleResponse: {
        status: 200,
        body: [{ id: "qt_001", status: "accepted" }]
      }
    },

    {
      id: "quotes-decline",
      folder: "Quotes",
      name: "Decline Quote",
      method: "PATCH",
      path: "/quotes?id=eq.{quoteId}",
      description: "Decline a provider's quote.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "quoteId", value: "qt_001", description: "The quote ID to decline" }
      ],
      body: { status: "declined" },
      sampleResponse: {
        status: 200,
        body: [{ id: "qt_001", status: "declined" }]
      }
    },

    // ── JOBS (HOMEOWNER) ──────────────────────────────────────────────────────

    {
      id: "jobs-list",
      folder: "Jobs",
      name: "List Jobs",
      method: "GET",
      path: "/jobs?homeowner_id=eq.{userId}&order=scheduled_date.asc",
      description: "List all jobs for the authenticated homeowner, ordered by upcoming scheduled date.",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The homeowner's user ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "job_001",
            homeowner_id: "usr_abc123xyz",
            provider_email: "provider@greenlawn.com",
            service_types: ["lawn_mowing"],
            scheduled_date: "2026-03-22",
            scheduled_time: "09:00",
            status: "scheduled"
          }
        ]
      }
    },

    {
      id: "jobs-cancel",
      folder: "Jobs",
      name: "Cancel Job",
      method: "PATCH",
      path: "/jobs?id=eq.{jobId}",
      description: "Cancel a scheduled job.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "jobId", value: "job_001", description: "The job ID to cancel" }
      ],
      body: { status: "cancelled" },
      sampleResponse: {
        status: 200,
        body: [{ id: "job_001", status: "cancelled" }]
      }
    },

    // ── MESSAGES ──────────────────────────────────────────────────────────────

    {
      id: "messages-threads",
      folder: "Messages",
      name: "Load Message Threads",
      method: "GET",
      path: "/messages?or=(from_user_id.eq.{userId},to_user_id.eq.{userId})&order=created_at.desc",
      description: "Load all message threads involving the authenticated user (both sent and received). Supports real-time subscriptions via Supabase channels.",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The authenticated user's ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "msg_001",
            from_user_id: "usr_abc123xyz",
            to_user_id: "usr_provider_999",
            body: "Hi, is Saturday morning available?",
            read: true,
            created_at: "2026-03-15T14:00:00Z"
          }
        ]
      }
    },

    {
      id: "messages-send",
      folder: "Messages",
      name: "Send Message",
      method: "POST",
      path: "/messages",
      description: "Send a message to another user. The recipient receives it via real-time Supabase subscription.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      body: {
        from_user_id: "usr_abc123xyz",
        to_user_id: "usr_provider_999",
        body: "Can we reschedule to 10am?",
        read: false
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "msg_002",
          from_user_id: "usr_abc123xyz",
          to_user_id: "usr_provider_999",
          body: "Can we reschedule to 10am?",
          read: false,
          created_at: "2026-03-15T14:05:00Z"
        }]
      }
    },

    {
      id: "messages-mark-read",
      folder: "Messages",
      name: "Mark Messages as Read",
      method: "PATCH",
      path: "/messages?to_user_id=eq.{userId}&from_user_id=eq.{partnerId}&read=eq.false",
      description: "Mark all unread messages in a conversation as read.",
      headers: [
        { key: "Content-Type", value: "application/json" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The authenticated user's ID (recipient)" },
        { key: "partnerId", value: "usr_provider_999", description: "The other participant's ID (sender)" }
      ],
      body: { read: true },
      sampleResponse: {
        status: 204,
        body: null
      }
    },

    // ── RECURRING SCHEDULES ───────────────────────────────────────────────────

    {
      id: "schedules-list",
      folder: "Schedules",
      name: "List Recurring Schedules",
      method: "GET",
      path: "/recurring_schedules?homeowner_id=eq.{userId}&order=created_at.desc",
      description: "List all recurring service schedules for the authenticated homeowner.",
      requiresAuth: true,
      pathParams: [
        { key: "userId", value: "usr_abc123xyz", description: "The homeowner's user ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "sched_001",
            homeowner_id: "usr_abc123xyz",
            provider_email: "provider@greenlawn.com",
            service_types: ["lawn_mowing"],
            frequency: "biweekly",
            status: "active",
            next_date: "2026-03-22",
            created_at: "2026-03-01T09:00:00Z"
          }
        ]
      }
    },

    {
      id: "schedules-update-status",
      folder: "Schedules",
      name: "Update Schedule Status",
      method: "PATCH",
      path: "/recurring_schedules?id=eq.{scheduleId}",
      description: "Pause, resume, or cancel a recurring schedule.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "scheduleId", value: "sched_001", description: "The recurring schedule ID" }
      ],
      body: { status: "paused" },
      sampleResponse: {
        status: 200,
        body: [{ id: "sched_001", status: "paused" }]
      }
    },

    // ── PROVIDER PROFILES ─────────────────────────────────────────────────────

    {
      id: "providers-list",
      folder: "Provider Profiles",
      name: "List All Providers",
      method: "GET",
      path: "/provider_profiles",
      description: "Retrieve all registered lawn care provider profiles. Public endpoint — no auth required.",
      requiresAuth: false,
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "prv_001",
            email: "provider@greenlawn.com",
            business_name: "Green Lawn Co.",
            description: "Family-owned lawn care since 2010.",
            phone: "615-555-0200",
            services_offered: ["lawn_mowing", "edging", "fertilization"],
            service_areas: ["37135", "37067"],
            years_in_business: 15,
            total_jobs: 312
          }
        ]
      }
    },

    {
      id: "providers-get",
      folder: "Provider Profiles",
      name: "Get Provider by ID",
      method: "GET",
      path: "/provider_profiles?id=eq.{providerId}",
      description: "Retrieve a single provider's full profile.",
      requiresAuth: false,
      pathParams: [
        { key: "providerId", value: "prv_001", description: "The provider's profile ID" }
      ],
      sampleResponse: {
        status: 200,
        body: [{
          id: "prv_001",
          email: "provider@greenlawn.com",
          business_name: "Green Lawn Co.",
          description: "Family-owned lawn care since 2010.",
          phone: "615-555-0200",
          address: "789 Commerce Dr, Nolensville, TN 37135",
          services_offered: ["lawn_mowing", "edging", "fertilization"],
          service_areas: ["37135", "37067"],
          years_in_business: 15,
          team_size: 4,
          equipment: "Commercial Husqvarna mowers",
          license_number: "TN-LCO-5521",
          portfolio: [],
          total_jobs: 312
        }]
      }
    },

    {
      id: "providers-create",
      folder: "Provider Profiles",
      name: "Create Provider Profile",
      method: "POST",
      path: "/provider_profiles",
      description: "Create a new provider profile. Requires the user to have the 'provider' role.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      body: {
        email: "provider@greenlawn.com",
        business_name: "Green Lawn Co.",
        description: "Family-owned lawn care since 2010.",
        phone: "615-555-0200",
        address: "789 Commerce Dr, Nolensville, TN 37135",
        years_in_business: 15,
        team_size: 4,
        equipment: "Commercial Husqvarna mowers",
        license_number: "TN-LCO-5521",
        services_offered: ["lawn_mowing", "edging", "fertilization"],
        service_areas: ["37135", "37067"],
        portfolio: [],
        total_jobs: 0
      },
      sampleResponse: {
        status: 201,
        body: [{ id: "prv_001", email: "provider@greenlawn.com", business_name: "Green Lawn Co." }]
      }
    },

    {
      id: "providers-update",
      folder: "Provider Profiles",
      name: "Update Provider Profile",
      method: "PATCH",
      path: "/provider_profiles?email=eq.{email}",
      description: "Update the authenticated provider's profile.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "email", value: "provider@greenlawn.com", description: "The provider's email address" }
      ],
      body: {
        description: "Award-winning lawn care since 2010.",
        team_size: 6,
        services_offered: ["lawn_mowing", "edging", "fertilization", "aeration"]
      },
      sampleResponse: {
        status: 200,
        body: [{ email: "provider@greenlawn.com", team_size: 6 }]
      }
    },

    // ── PROVIDER QUOTES ───────────────────────────────────────────────────────

    {
      id: "provider-quote-requests",
      folder: "Provider Quotes",
      name: "Get Open Quote Requests",
      method: "GET",
      path: "/quote_requests?status=eq.pending&order=created_at.desc",
      description: "Retrieve open quote requests visible to the provider. Providers should filter client-side by their service_areas ZIP codes.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "qreq_789def",
            service_types: ["lawn_mowing", "edging"],
            lot_size: 8500,
            terrain: "flat",
            preferred_date: "2026-03-22",
            schedule_type: "recurring",
            recurrence_frequency: "biweekly",
            status: "pending",
            created_at: "2026-03-15T11:00:00Z"
          }
        ]
      }
    },

    {
      id: "provider-quotes-list",
      folder: "Provider Quotes",
      name: "Get My Submitted Quotes",
      method: "GET",
      path: "/provider_quotes?provider_email=eq.{email}&order=created_at.desc",
      description: "Retrieve all quotes the authenticated provider has submitted.",
      requiresAuth: true,
      pathParams: [
        { key: "email", value: "provider@greenlawn.com", description: "The provider's email address" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "pq_001",
            request_id: "qreq_789def",
            provider_email: "provider@greenlawn.com",
            amount: 65.00,
            duration_days: 1,
            validity_days: 7,
            notes: "Includes full cleanup.",
            status: "pending",
            created_at: "2026-03-15T12:00:00Z"
          }
        ]
      }
    },

    {
      id: "provider-quotes-submit",
      folder: "Provider Quotes",
      name: "Submit Quote",
      method: "POST",
      path: "/provider_quotes",
      description: "Submit a price quote in response to a homeowner's quote request.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      body: {
        request_id: "qreq_789def",
        provider_email: "provider@greenlawn.com",
        amount: 65.00,
        amount_min: null,
        amount_max: null,
        duration_days: 1,
        validity_days: 7,
        notes: "Includes full cleanup.",
        status: "pending"
      },
      sampleResponse: {
        status: 201,
        body: [{ id: "pq_001", request_id: "qreq_789def", amount: 65.00, status: "pending" }]
      }
    },

    {
      id: "provider-quotes-update",
      folder: "Provider Quotes",
      name: "Update Quote Status",
      method: "PATCH",
      path: "/provider_quotes?id=eq.{quoteId}",
      description: "Update the status of a submitted quote. Use 'withdrawn' to retract a quote.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "quoteId", value: "pq_001", description: "The provider quote ID" }
      ],
      body: { status: "withdrawn" },
      sampleResponse: {
        status: 200,
        body: [{ id: "pq_001", status: "withdrawn" }]
      }
    },

    // ── PROVIDER JOBS ─────────────────────────────────────────────────────────

    {
      id: "provider-jobs-list",
      folder: "Provider Jobs",
      name: "List My Jobs",
      method: "GET",
      path: "/provider_jobs?provider_email=eq.{email}&order=scheduled_date.asc",
      description: "List all jobs assigned to the authenticated provider.",
      requiresAuth: true,
      pathParams: [
        { key: "email", value: "provider@greenlawn.com", description: "The provider's email address" }
      ],
      sampleResponse: {
        status: 200,
        body: [
          {
            id: "pjob_001",
            provider_email: "provider@greenlawn.com",
            homeowner_id: "usr_abc123xyz",
            service_types: ["lawn_mowing"],
            scheduled_date: "2026-03-22",
            scheduled_time: "09:00",
            status: "scheduled"
          }
        ]
      }
    },

    {
      id: "provider-jobs-update-status",
      folder: "Provider Jobs",
      name: "Update Job Status",
      method: "PATCH",
      path: "/provider_jobs?id=eq.{jobId}",
      description: "Update the status of a job. Allowed values: 'scheduled', 'in-progress', 'complete'.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "jobId", value: "pjob_001", description: "The provider job ID" }
      ],
      body: { status: "in-progress" },
      sampleResponse: {
        status: 200,
        body: [{ id: "pjob_001", status: "in-progress" }]
      }
    },

    {
      id: "provider-jobs-reschedule",
      folder: "Provider Jobs",
      name: "Reschedule Job",
      method: "PATCH",
      path: "/provider_jobs?id=eq.{jobId}",
      description: "Change the scheduled date and time for a job.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: true,
      pathParams: [
        { key: "jobId", value: "pjob_001", description: "The provider job ID" }
      ],
      body: {
        scheduled_date: "2026-03-25",
        scheduled_time: "10:00"
      },
      sampleResponse: {
        status: 200,
        body: [{ id: "pjob_001", scheduled_date: "2026-03-25", scheduled_time: "10:00" }]
      }
    },

    // ── PROVIDER AVAILABILITY ─────────────────────────────────────────────────

    {
      id: "availability-get",
      folder: "Availability",
      name: "Get Availability",
      method: "GET",
      path: "/provider_availability?provider_email=eq.{email}",
      description: "Retrieve the provider's availability settings including working hours, blocked dates, and job limits.",
      requiresAuth: true,
      pathParams: [
        { key: "email", value: "provider@greenlawn.com", description: "The provider's email address" }
      ],
      sampleResponse: {
        status: 200,
        body: [{
          provider_email: "provider@greenlawn.com",
          weekly_windows: {
            monday: { start: "08:00", end: "17:00" },
            tuesday: { start: "08:00", end: "17:00" },
            wednesday: { start: "08:00", end: "17:00" },
            thursday: { start: "08:00", end: "17:00" },
            friday: { start: "08:00", end: "15:00" },
            saturday: null,
            sunday: null
          },
          blocked_dates: ["2026-03-20", "2026-03-27"],
          max_jobs_per_day: 5,
          max_jobs_per_week: 20
        }]
      }
    },

    {
      id: "availability-save",
      folder: "Availability",
      name: "Save Availability",
      method: "POST",
      path: "/provider_availability",
      description: "Upsert availability settings for the provider. Uses Supabase 'on conflict' upsert on provider_email.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "resolution=merge-duplicates,return=representation" }
      ],
      requiresAuth: true,
      body: {
        provider_email: "provider@greenlawn.com",
        weekly_windows: {
          monday: { start: "08:00", end: "17:00" },
          friday: { start: "08:00", end: "15:00" }
        },
        blocked_dates: ["2026-03-20"],
        max_jobs_per_day: 4,
        max_jobs_per_week: 16
      },
      sampleResponse: {
        status: 201,
        body: [{ provider_email: "provider@greenlawn.com", max_jobs_per_day: 4 }]
      }
    },

    // ── LEADS ─────────────────────────────────────────────────────────────────

    {
      id: "leads-submit",
      folder: "Leads",
      name: "Submit Lead",
      method: "POST",
      path: "/leads",
      description: "Submit a contact or quote inquiry. Used by the public Get Quote and Contact pages. Falls back to localStorage if Supabase is unavailable.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: false,
      body: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "615-555-0100",
        service: "lawn_mowing",
        property_size: 8500,
        address: "123 Main St, Nolensville, TN 37135",
        frequency: "biweekly",
        message: "Looking for reliable weekly service.",
        source: "quote_form",
        submitted_at: "2026-03-15T10:00:00Z"
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "lead_001",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          source: "quote_form",
          submitted_at: "2026-03-15T10:00:00Z"
        }]
      }
    },

    // ── ORDERS ────────────────────────────────────────────────────────────────

    {
      id: "orders-create",
      folder: "Orders",
      name: "Create Order",
      method: "POST",
      path: "/orders",
      description: "Place an annual lawn care plan order. Order ID is generated as 'NPL-{timestamp}'. Falls back to localStorage if Supabase is unavailable.",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Prefer", value: "return=representation" }
      ],
      requiresAuth: false,
      body: {
        id: "NPL-1710500000000",
        plan: "Premium",
        sqft: 8500,
        total: 599.00,
        avg_per_app: 74.88,
        rounds: 8,
        customer_name: "Jane Smith",
        customer_email: "jane.smith@example.com",
        customer_phone: "615-555-0100",
        customer_address: "123 Main St",
        customer_city: "Nolensville",
        customer_zip: "37135",
        submitted_at: "2026-03-15T10:00:00Z"
      },
      sampleResponse: {
        status: 201,
        body: [{
          id: "NPL-1710500000000",
          plan: "Premium",
          total: 599.00,
          customer_email: "jane.smith@example.com",
          submitted_at: "2026-03-15T10:00:00Z"
        }]
      }
    },

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    {
      id: "admin-orders",
      folder: "Admin",
      name: "Get All Orders",
      method: "GET",
      path: "/orders?order=submitted_at.desc",
      description: "Admin only. Retrieve all orders across all customers.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          { id: "NPL-1710500000000", plan: "Premium", total: 599.00, customer_email: "jane.smith@example.com", submitted_at: "2026-03-15T10:00:00Z" }
        ]
      }
    },

    {
      id: "admin-leads",
      folder: "Admin",
      name: "Get All Leads",
      method: "GET",
      path: "/leads?order=submitted_at.desc",
      description: "Admin only. Retrieve all contact and quote form submissions.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          { id: "lead_001", name: "Jane Smith", email: "jane.smith@example.com", source: "quote_form", submitted_at: "2026-03-15T10:00:00Z" }
        ]
      }
    },

    {
      id: "admin-users",
      folder: "Admin",
      name: "Get All Users",
      method: "GET",
      path: "/profiles?select=id,email,name,role,created_at&order=created_at.desc",
      description: "Admin only. Retrieve all user profiles.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          { id: "usr_abc123xyz", email: "jane.smith@example.com", name: "Jane Smith", role: "user", created_at: "2026-03-15T10:30:00Z" }
        ]
      }
    },

    {
      id: "admin-providers",
      folder: "Admin",
      name: "Get All Provider Profiles",
      method: "GET",
      path: "/provider_profiles?order=total_jobs.desc",
      description: "Admin only. Retrieve all provider profiles sorted by job count.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          { id: "prv_001", business_name: "Green Lawn Co.", email: "provider@greenlawn.com", total_jobs: 312 }
        ]
      }
    },

    {
      id: "admin-quote-requests",
      folder: "Admin",
      name: "Get All Quote Requests",
      method: "GET",
      path: "/quote_requests?order=created_at.desc",
      description: "Admin only. Retrieve all quote requests across all homeowners.",
      requiresAuth: true,
      sampleResponse: {
        status: 200,
        body: [
          { id: "qreq_789def", homeowner_id: "usr_abc123xyz", service_types: ["lawn_mowing"], status: "pending", created_at: "2026-03-15T11:00:00Z" }
        ]
      }
    }

  ]
};

export default NP_LAWN_API_COLLECTION;
