//
// Supported response code with their value and description
//

export const codes = {
  Ok:                  200,
  BadRequest:          400,
  Unauthorized:        401, // aka unauthenticated according to the standard
  Forbidden:           403,
  NotFound:            404,
  InternalServerError: 500,
} as const;

export type CodesType = typeof codes[keyof typeof codes];

const messages: Record<CodesType, string> = {
  [codes.Ok]:                  "Ok",
  [codes.BadRequest]:          "Requête invalide",
  [codes.Unauthorized]:        "Connexion requise",
  [codes.Forbidden]:           "Accès refusé",
  [codes.NotFound]:            "Page non trouvée",
  [codes.InternalServerError]: "Erreur interne",
};

export function getMessage(code: CodesType): string {
  return messages[code];
}
