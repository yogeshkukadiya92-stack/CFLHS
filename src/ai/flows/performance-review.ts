'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating employee performance reviews using Gemini AI.
 *
 * @module performance-review
 * @exports generatePerformanceReview - An async function to generate reviews.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformanceReviewInputSchema = z.object({
  employeeName: z.string(),
  kraData: z.array(z.object({
    task: z.string(),
    progress: z.number(),
    status: z.string(),
    marks: z.number(),
  })),
});
export type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;

const PerformanceReviewOutputSchema = z.object({
  summary: z.string().describe('A general summary of the employee performance.'),
  strengths: z.array(z.string()).describe('List of key strengths identified.'),
  areasForImprovement: z.array(z.string()).describe('List of areas where the employee can improve.'),
  overallSentiment: z.string().describe('Overall performance sentiment (e.g. Excellent, Meeting Expectations, Needs Improvement).'),
});
export type PerformanceReviewOutput = z.infer<typeof PerformanceReviewOutputSchema>;

export async function generatePerformanceReview(
  input: PerformanceReviewInput
): Promise<PerformanceReviewOutput> {
  return generatePerformanceReviewFlow(input);
}

const performanceReviewPrompt = ai.definePrompt({
  name: 'performanceReviewPrompt',
  input: {schema: PerformanceReviewInputSchema},
  output: {schema: PerformanceReviewOutputSchema},
  prompt: `You are an expert HR Performance Manager. Analyze the following performance data for {{employeeName}} and provide a detailed review.

  KRA Data:
  {{#each kraData}}
  - Task: {{task}}
    Progress: {{progress}}%
    Status: {{status}}
    Marks Achieved: {{marks}}
  {{/each}}

  Please provide a professional assessment in the following format:
  1. A clear summary paragraph.
  2. A list of 3-4 key strengths.
  3. A list of 2-3 specific areas for improvement.
  4. An overall performance sentiment rating.`,
});

const generatePerformanceReviewFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReviewFlow',
    inputSchema: PerformanceReviewInputSchema,
    outputSchema: PerformanceReviewOutputSchema,
  },
  async input => {
    const {output} = await performanceReviewPrompt(input);
    return output!;
  }
);
