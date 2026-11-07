export function normalizeError(err) {
  const response = err?.response?.data;
  const message =
    response?.message ||
    (typeof response?.data === 'string' ? response.data : null) ||
    err?.message ||
    'Something went wrong';

  return {
    success: false,
    message,
    code: response?.code || err?.code || 'UNKNOWN',
    status: err?.response?.status || 0,
    errors: response?.errors || [],
  };
}

export function getUserMessage(error) {
  if (!error) return 'Something went wrong';
  if (typeof error === 'string') return error;
  return error.message || 'Something went wrong';
}
