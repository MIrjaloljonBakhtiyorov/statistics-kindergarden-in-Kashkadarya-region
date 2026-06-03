import { Request } from 'express';
export function getKindergartenIdFromRequest(req: Request): string | undefined {
  const headerValue = req.headers['x-kindergarten-id'];
  const headerId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return (
    headerId ||
    (req.body?.kindergarten_id != null ? String(req.body.kindergarten_id) : undefined) ||
    (req.query?.kindergarten_id != null ? String(req.query.kindergarten_id) : undefined)
  );
}

export async function resolveKindergartenId(req: Request): Promise<string> {
  const requestId = getKindergartenIdFromRequest(req);
  if (requestId) return requestId;

  throw new Error('Kindergarten ID missing');
}
