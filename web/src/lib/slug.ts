import slugify from "slugify";

export function slugifyHeadline(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}
