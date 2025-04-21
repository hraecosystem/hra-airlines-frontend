// app/lib/utils.ts
export function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(" ");
  }
  