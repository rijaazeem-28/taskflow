import { zodResolver as hookformZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/** Bridges Zod 3 schemas with @hookform/resolvers typings in this monorepo. */
export function zodResolver<T extends FieldValues>(
  schema: z.ZodType<T>
): Resolver<T> {
  return hookformZodResolver(schema as never) as Resolver<T>;
}
