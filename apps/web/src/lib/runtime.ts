/** Local JSON store is for development only — Vercel/serverless FS is read-only. */
export function canUseLocalStore() {
  if (process.env.VERCEL) return false;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  if (process.env.USE_LOCAL_STORE === "false") return false;
  return true;
}
