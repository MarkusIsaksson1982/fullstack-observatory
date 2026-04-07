const { z } = require("zod");

function escapeHtml(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const schemas = {
  createUser: z.object({
    name: z.string().min(1).max(200).transform(escapeHtml),
    email: z.string().email().max(254),
    role: z.enum(["admin", "member", "guest"]).optional().default("member")
  }),
  updateUser: z.object({
    name: z.string().min(1).max(200).transform(escapeHtml).optional(),
    email: z.string().email().max(254).optional(),
    role: z.enum(["admin", "member", "guest"]).optional()
  }),
  idParam: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a positive integer")
  })
};

function getSchema(schemaName) {
  switch (schemaName) {
    case "createUser":
      return schemas.createUser;
    case "updateUser":
      return schemas.updateUser;
    case "idParam":
      return schemas.idParam;
    default:
      return undefined;
  }
}

function validate(schemaName, source = "body") {
  const schema = getSchema(schemaName);

  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  return function validateMiddleware(req, res, next) {
    const payload = source === "params" ? req.params : req.body;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return res.status(400).json({
        error: "ValidationError",
        message: `Invalid ${source}: ${details.map((detail) => detail.message).join("; ")}`,
        details
      });
    }

    req[source === "params" ? "validatedParams" : "validatedBody"] = result.data;
    next();
  };
}

module.exports = { validate, schemas, escapeHtml };
