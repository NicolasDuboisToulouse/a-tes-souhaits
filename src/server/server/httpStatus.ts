//
// Supported response status with their value and description
//

export const Status = {
  Ok:                  200,
  Found:               302, // Status for redirect pages
  BadRequest:          400,
  Unauthorized:        401, // aka unauthenticated according to the standard
  Forbidden:           403,
  NotFound:            404,
  InternalServerError: 500,
} as const;

export type StatusType = typeof Status[keyof typeof Status];

const messages: Record<StatusType, string> = {
  [Status.Ok]:                  "Ok",
  [Status.Found]:               "Page trouvée",
  [Status.BadRequest]:          "Requête invalide",
  [Status.Unauthorized]:        "Connexion requise",
  [Status.Forbidden]:           "Accès refusé",
  [Status.NotFound]:            "Page non trouvée",
  [Status.InternalServerError]: "Erreur interne",
};

export function getMessage(status: StatusType): string {
  return messages[status];
}
