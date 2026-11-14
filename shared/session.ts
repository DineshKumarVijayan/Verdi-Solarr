// Session lifetime rules shared by the Worker (authoritative) and the browser (UI timer).

/** Signed-in users (staff and customers) are signed out after this many minutes without activity. */
export const IDLE_MINUTES = 30;
/** Absolute cap on one staff sign-in, however active. */
export const ADMIN_MAX_HOURS = 12;
/** Absolute cap on one customer sign-in, however active. */
export const CUSTOMER_MAX_DAYS = 30;
/** The idle deadline is pushed forward at most this often (limits database writes). */
export const SLIDE_EVERY_MINUTES = 5;

/** Staff added without an email get an internal placeholder (the Email column is required and unique). */
export const PLACEHOLDER_EMAIL_DOMAIN = "staff.invalid";
export const isPlaceholderEmail = (email: string | null | undefined) => !!email && email.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
