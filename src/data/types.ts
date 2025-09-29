import { z } from "zod";

export const InstrumentSchema = z.object({
  rank: z.number().int().positive(),
  name: z.string(),
  description: z.string().optional(),
  referralUrl: z.string().url(),
  bonus: z.string().optional(),
  tags: z.array(z.string()).default([]),
  logo: z.string().optional(), // ex: "/logos/tradingview.svg" în public
});

export type Instrument = z.infer<typeof InstrumentSchema>;
export const InstrumentListSchema = z.array(InstrumentSchema);
