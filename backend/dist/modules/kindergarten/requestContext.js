export function getKindergartenIdFromRequest(req) {
    const headerValue = req.headers['x-kindergarten-id'];
    const headerId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    return (headerId ||
        (req.body?.kindergarten_id != null ? String(req.body.kindergarten_id) : undefined) ||
        (req.query?.kindergarten_id != null ? String(req.query.kindergarten_id) : undefined));
}
export async function resolveKindergartenId(req) {
    const requestId = getKindergartenIdFromRequest(req);
    if (requestId)
        return requestId;
    throw new Error('Kindergarten ID missing');
}
