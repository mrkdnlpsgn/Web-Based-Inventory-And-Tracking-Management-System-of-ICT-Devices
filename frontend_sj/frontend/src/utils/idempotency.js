// One key per create-form-instance (generate it once in a useState initializer),
// reused across retries of that same submission so a network retry or double-tap
// can't create a duplicate record. A fresh key naturally appears each time the form
// remounts for a new entry.
export const newIdempotencyKey = () => crypto.randomUUID()
