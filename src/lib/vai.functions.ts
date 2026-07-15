import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "openai/gpt-5.5";

function getGateway(structured = false) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key, { structuredOutputs: structured });
}

// ── Document Search ────────────────────────────────────────────────
const SearchInput = z.object({ query: z.string().min(1).max(500) });

export const searchDocuments = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => SearchInput.parse(v))
  .handler(async ({ data }) => {
    const gateway = getGateway(true);
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({
          schema: z.object({
            matches: z.array(
              z.object({
                filename: z.string(),
                type: z.string(),
                confidence: z.number(),
                reason: z.string(),
              }),
            ),
            interpretation: z.string(),
          }),
        }),
        system:
          "You are VAI Recon, an AI reconciliation assistant for an accounting team. Given a query (payment reference, invoice number, customer name, or amount), simulate a fuzzy-match search across a plausible document set (proof of payment PDFs, remittance advice XLSX, bank statements CSV, invoices). Produce 3-5 realistic candidate matches with confidence scores 0-100. Filenames must look real (e.g. POP_INV2035_ABC_28Mar2026.pdf). Do not include a disclaimer.",
        prompt: `Query: ${data.query}`,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { matches: [], interpretation: "Could not parse response. Try rephrasing." };
      }
      throw error;
    }
  });

// ── Chatbot ────────────────────────────────────────────────────────
const ChatInput = z.object({ question: z.string().min(1).max(1000) });

export const askChatbot = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => ChatInput.parse(v))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { text } = await generateText({
      model: gateway(MODEL),
      system:
        "You are VAI, an AI reconciliation assistant for accountants. Answer concisely (under 120 words). When asked to locate documents, invoices, or payments, respond as if you have access to the ledger: name a plausible file, amount (in ZAR), date, and next-step status (e.g. 'Ready to reconcile'). Use short lines, no markdown headings. Never invent a legal disclaimer.",
      prompt: data.question,
    });
    return { text };
  });

// ── Task Planner ───────────────────────────────────────────────────
const PrioritizeInput = z.object({ accounts: z.string().min(1).max(4000) });

export const prioritizeAccounts = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => PrioritizeInput.parse(v))
  .handler(async ({ data }) => {
    const gateway = getGateway(true);
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({
          schema: z.object({
            priorities: z.array(
              z.object({
                rank: z.number(),
                account: z.string(),
                age_days: z.number(),
                risk: z.string(),
                action: z.string(),
              }),
            ),
            recommendation: z.string(),
          }),
        }),
        system:
          "You are VAI Recon's task planner. Given a list of unreconciled accounts with ages and (optionally) amounts, rank them by priority (oldest and highest-risk first). Return 3-6 ranked items and a one-sentence cash-flow recommendation.",
        prompt: data.accounts,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { priorities: [], recommendation: "Could not parse. Please provide accounts in a clearer list." };
      }
      throw error;
    }
  });

// ── Auto-Tracer ────────────────────────────────────────────────────
const TraceInput = z.object({
  amount: z.string().min(1).max(50),
  date: z.string().max(50).nullable(),
  reference: z.string().max(100).nullable(),
});

export const autoTracePayment = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => TraceInput.parse(v))
  .handler(async ({ data }) => {
    const gateway = getGateway(true);
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({
          schema: z.object({
            match: z.object({
              invoice: z.string(),
              customer: z.string(),
              amount: z.string(),
            }),
            reason: z.string(),
            history: z.string(),
            confidence: z.number(),
          }),
        }),
        system:
          "You are VAI Recon's auto-tracer. Given a mystery bank deposit (amount in ZAR, date, short bank reference), infer the most likely open invoice and customer from a plausible ledger. Return a single best match with a concise reason (amount/date/reference logic), a one-sentence customer payment-history note, and a confidence 0-100. Do not add disclaimers.",
        prompt: `Amount: R${data.amount}\nDate: ${data.date ?? "unknown"}\nBank Ref: ${data.reference ?? "unknown"}`,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          match: { invoice: "—", customer: "No confident match", amount: `R${data.amount}` },
          reason: "Could not infer a match from the provided details.",
          history: "",
          confidence: 0,
        };
      }
      throw error;
    }
  });
