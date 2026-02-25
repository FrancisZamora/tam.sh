import { moderateContent } from "@/lib/moderation";

// Mock groq-sdk
jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

import Groq from "groq-sdk";

const mockCreate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (Groq as unknown as jest.Mock).mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

describe("moderateContent", () => {
  it("returns flagged: false when GROQ_API_KEY is not set", async () => {
    const original = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const result = await moderateContent("test content");
    expect(result.flagged).toBe(false);
    expect(result.categories).toEqual([]);

    if (original) process.env.GROQ_API_KEY = original;
  });

  it("returns flagged: false for safe content", async () => {
    process.env.GROQ_API_KEY = "test-key";

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "safe" } }],
    });

    const result = await moderateContent("What is the global AI market size?");
    expect(result.flagged).toBe(false);
    expect(result.categories).toEqual([]);
  });

  it("returns flagged: true with categories for unsafe content", async () => {
    process.env.GROQ_API_KEY = "test-key";

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "unsafe\nS1\nS2" } }],
    });

    const result = await moderateContent("some unsafe content");
    expect(result.flagged).toBe(true);
    expect(result.categories).toEqual(["S1", "S2"]);
  });

  it("fails open when API call throws", async () => {
    process.env.GROQ_API_KEY = "test-key";

    mockCreate.mockRejectedValue(new Error("API error"));

    const result = await moderateContent("test content");
    expect(result.flagged).toBe(false);
    expect(result.categories).toEqual([]);
  });

  it("handles empty response gracefully", async () => {
    process.env.GROQ_API_KEY = "test-key";

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
    });

    const result = await moderateContent("test content");
    expect(result.flagged).toBe(false);
  });
});
