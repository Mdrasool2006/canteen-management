// Creates an Error carrying an HTTP status code
export default function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
