import { apiClient } from './api.config';

export interface JobStatusResponse {
    jobId: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress?: {
        percentage: number;
        current?: number;
        total?: number;
    };
    result?: any[];
}

export const jobService = {
    // API CONNECTOR 3 — Job Status Tracking
    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        try {
            // Endpoint: /api/bulk/status/{{jobId}}
            const response = await apiClient.get(`/api/bulk/status/${jobId}`);

            // Backend logic: { success: true, job: { status: 'PROCESSING', ... } }
            // So we need to look into response.data.job
            const jobData = response.data?.job || response.data?.data || response.data;

            return {
                jobId: jobData._id || jobData.jobId || jobId,
                status: jobData.status,
                progress: {
                    percentage: jobData.totalRows ? Math.round((jobData.processedRows / jobData.totalRows) * 100) : 0,
                    current: jobData.processedRows,
                    total: jobData.totalRows
                },
                result: jobData.result
            };
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to get job status';
            throw new Error(message);
        }
    },

    // Poll until COMPLETED or FAILED
    pollJobStatus(
        jobId: string,
        onUpdate: (status: JobStatusResponse) => void,
        intervalMs: number = 3000
    ): () => void {
        let timeoutId: NodeJS.Timeout;
        let isPolling = true;

        const poll = async () => {
            if (!isPolling) return;

            try {
                const status = await this.getJobStatus(jobId);
                onUpdate(status);

                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    isPolling = false;
                    return;
                }
            } catch (error) {
                console.error("Polling error:", error);
                // Optionally stop polling on critical errors, OR keep retrying
            }

            if (isPolling) {
                timeoutId = setTimeout(poll, intervalMs);
            }
        };

        // Start polling
        poll();

        // Return a stop function
        return () => {
            isPolling = false;
            clearTimeout(timeoutId);
        };
    }
};
