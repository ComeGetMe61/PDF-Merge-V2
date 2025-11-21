import { CoverPageData } from "../types";

/**
 * Configuration for the Azure Function Endpoint.
 * After deploying your function, paste the Function URL here.
 * Example: "https://my-pdf-manager.azurewebsites.net/api/gemini-handler"
 */
const AZURE_FUNCTION_URL = "https://pdf-ai-manager.azurewebsites.net/api/pdfsort"; 

/**
 * Helper to make calls to the Azure Function.
 */
async function callAzureFunction(payload: any) {
  if (!AZURE_FUNCTION_URL) {
    throw new Error("Azure Function URL is not configured. Please deploy the function and update 'services/geminiService.ts'.");
  }

  const response = await fetch(AZURE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Function Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Request the Azure Function to generate cover page content.
 */
export const generateCoverPageContent = async (description: string): Promise<CoverPageData> => {
  try {
    const result = await callAzureFunction({
      action: 'cover-page',
      description: description
    });
    return result as CoverPageData;
  } catch (error) {
    console.error("Remote Cover Page Generation Error:", error);
    throw error;
  }
};

/**
 * Request the Azure Function to sort the files.
 */
export const smartSortFiles = async (files: { id: string; name: string }[]): Promise<string[]> => {
  try {
    const result = await callAzureFunction({
      action: 'smart-sort',
      files: files
    });
    return result.sortedIds || [];
  } catch (error) {
    console.error("Remote Smart Sort Error:", error);
    throw error;
  }
};