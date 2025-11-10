export function generatePatientId(
  iso: string | number | undefined,
  id: number | string
) {
  const date = iso ? new Date(iso) : undefined;
  const year = date?.getUTCFullYear();
  return `PT-${year}-${String(id).padStart(3, "0")}`;
}
