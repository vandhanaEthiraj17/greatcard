import { apiClient } from './api.config';

export interface GenerateSingleCardRequest {
    prompt: string;
    templateId?: string;
}

export interface GenerateSingleCardResponse {
    imageUrl: string;
    metadata?: any;
}

export type GenerateBulkCardsRequest = FormData;

export interface GenerateBulkCardsResponse {
    jobId: string;
    status: string;
    monitorUrl: string;
}

export const cardService = {
    // API CONNECTOR 1 — Single Card Generation
    async generateSingleCard(data: GenerateSingleCardRequest): Promise<GenerateSingleCardResponse> {
        try {
            // URL: /api/ai/generate-template
            const response = await apiClient.post('/api/ai/generate-template', {
                prompt: data.prompt,
                templateId: data.templateId,
                count: 1 // Force single generation
            });

            // Backend Response: { success: true, templates: [ { id, imageUrl } ] }
            if (response.data?.templates && response.data.templates.length > 0) {
                return {
                    imageUrl: response.data.templates[0].imageUrl,
                    metadata: response.data.templates[0].metadata
                };
            }

            throw new Error('No template generated');
        } catch (error: any) {
            // Error Mapping: errorMessage -> message
            const message = error.response?.data?.message || error.message || 'Failed to generate card';
            throw new Error(message);
        }
    },

    // API CONNECTOR 2 — Bulk Card Generation (Async)
    async generateBulkCards(data: FormData): Promise<GenerateBulkCardsResponse> {
        try {
            const response = await apiClient.post('/api/bulk/generate', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Success Response Mapping
            if (response.data?.data) {
                return {
                    jobId: response.data.data.jobId,
                    status: response.data.data.status,
                    monitorUrl: response.data.data.monitorUrl
                };
            }
            // Fallback
            return {
                jobId: response.data?.jobId,
                status: response.data?.status,
                monitorUrl: response.data?.monitorUrl
            };
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to start bulk generation';
            throw new Error(message);
        }
    }
};
