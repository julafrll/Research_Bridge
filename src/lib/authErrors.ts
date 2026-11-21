/** Turn Supabase's verify / send errors into messages a participant understands. */
export function friendlyCodeError(message: string): string {
  if (/expired|invalid|not found/i.test(message)) {
    return 'That code is incorrect or has expired. Check the latest email, or request a new code.';
  }
  if (/rate limit|only request this after|security purposes/i.test(message)) {
    return 'Too many emails were requested. Please wait a minute and try again.';
  }
  if (/signups not allowed/i.test(message)) {
    return 'There is no account with this email yet. Create one first.';
  }
  if (/not authorized/i.test(message)) {
    return 'We could not send email to this address. Please contact the organizers.';
  }
  return message;
}
