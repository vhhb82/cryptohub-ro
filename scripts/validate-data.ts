// scripts/validate-data.ts
import { InstrumentListSchema } from "@/data/types";
import data from "@/data/instruments.json";


const res = InstrumentListSchema.safeParse(data);
if (!res.success) {
  console.error("Instrumente JSON invalid:", res.error.flatten());
  process.exit(1);
}
console.log("Instrumente JSON valide ✅");
