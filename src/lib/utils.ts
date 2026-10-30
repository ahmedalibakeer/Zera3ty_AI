export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export const statusText: Record<string, string> = { new: "جديد", reviewing: "قيد المراجعة", replied: "تم الرد" };
