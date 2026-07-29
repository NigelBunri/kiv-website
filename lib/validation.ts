export type FormKind = "contact" | "partner" | "investor" | "launch" | "deletion" | "security";

export type FormResult = {
  ok: boolean;
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};

const limits: Record<string, number> = {
  name: 120,
  email: 180,
  organisation: 160,
  subject: 180,
  message: 3000,
  product: 80,
};

export function sanitizeText(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
}

export function validatePublicForm(formData: FormData): FormResult & { payload?: Record<string, string> } {
  const kind = sanitizeText(formData.get("kind"), 40) as FormKind;
  const name = sanitizeText(formData.get("name"), limits.name);
  const email = sanitizeText(formData.get("email"), limits.email);
  const organisation = sanitizeText(formData.get("organisation"), limits.organisation);
  const subject = sanitizeText(formData.get("subject"), limits.subject);
  const product = sanitizeText(formData.get("product"), limits.product);
  const message = sanitizeText(formData.get("message"), limits.message);
  const website = sanitizeText(formData.get("website"), 120);
  const consent = sanitizeText(formData.get("consent"), 10);

  const fieldErrors: Record<string, string> = {};
  if (website) fieldErrors.website = "This request could not be accepted.";
  if (!["contact", "partner", "investor", "launch", "deletion", "security"].includes(kind)) fieldErrors.kind = "Choose a valid request type.";
  if (name.length < 2) fieldErrors.name = "Enter your name.";
  if (!validateEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (subject.length < 4) fieldErrors.subject = "Enter a clear subject.";
  if (message.length < 20) fieldErrors.message = "Add enough detail for the KIV team to respond.";
  if (consent !== "on") fieldErrors.consent = "Confirm that you understand how this request will be handled.";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, status: 400, message: "Please correct the highlighted fields.", fieldErrors };
  }

  return {
    ok: true,
    status: 200,
    message: process.env.KIV_FORM_PROVIDER
      ? "Your request is ready for the configured delivery provider."
      : "Your request was validated. Email delivery is not configured in this environment.",
    payload: { kind, name, email, organisation, subject, product, message },
  };
}
