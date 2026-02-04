import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/common/Icon";
import { Palette, FileSpreadsheet } from "lucide-react";
import { EXTENSION_TYPES } from "@/utils/constants";
import { useEditorStore } from "@/store/editorStore";

interface StepInputDataProps {
    onNext: (data: { brand: any, batchData: any }) => void;
    onBack: () => void;
    initialData?: { brand: any, batchData: any } | null;
}

const StepInputData = ({ onNext, onBack }: StepInputDataProps) => {

    // Global Store
    const { inputData, setInputData } = useEditorStore();
    const { mode, brand, manualData, batchData } = inputData;

    // Local UI State
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleModeChange = (newMode: 'csv' | 'manual') => {
        setInputData({ mode: newMode });
    };

    const handleCSVUpload = async (selectedFile: File) => {
        setIsUploading(true);
        setError("");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/upload/csv', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setInputData({ batchData: data.data });
            } else {
                setError(data.message || "Upload failed");
            }
        } catch (err) {
            console.error(err);
            setError("Network error uploading CSV");
        } finally {
            setIsUploading(false);
        }
    };

    const handleContinue = () => {
        if (mode === 'csv') {
            if (!batchData) return;
            onNext({
                brand,
                batchData
            });
        } else {
            // Manual Mode: Construct a pseudo-batch for downstream compatibility
            if (!manualData.name) return;

            const singleBatch = {
                id: `manual-${Date.now()}`,
                filename: 'manual-entry',
                rowCount: 1,
                headers: ['Name', 'Position', 'Occasion', 'Phone', 'Email'],
                preview: [{
                    'Name': manualData.name,
                    'Position': manualData.position,
                    'Occasion': manualData.occasion,
                    'Phone': manualData.phone || '',
                    'Email': manualData.email || ''
                }],
                rows: [{
                    'Name': manualData.name,
                    'Position': manualData.position,
                    'Occasion': manualData.occasion,
                    'Phone': manualData.phone || '',
                    'Email': manualData.email || ''
                }]
            };

            // Update store with this "processed" batch data too, so Step 3 can access it consistently if it uses batchData
            setInputData({ batchData: singleBatch as any });

            onNext({
                brand,
                batchData: singleBatch
            });
        }
    };

    const isNextDisabled = () => {
        if (mode === 'csv') return !batchData;
        return !manualData.name;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Input Data</h2>
                <p className="text-gray-500">Configure brand and recipient data</p>
            </div>

            {/* SECTION A: Brand Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon={Palette} className="text-brand-blue" />
                        Brand Configuration
                    </CardTitle>
                    <CardDescription>Setup your brand identity.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Input
                            label="Brand Name"
                            placeholder="Acme Corp"
                            value={brand.name}
                            onChange={(e) => setInputData({ brand: { ...brand, name: e.target.value } })}
                        />
                    </div>
                    <div>
                        <FileUpload
                            label="Brand Logo (PNG/SVG)"
                            accept=".png,.svg,.jpg"
                            onFileSelect={(f) => setInputData({ brand: { ...brand, logo: f } })}
                            maxSizeMB={2}
                            className="h-full"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SECTION B: Data Input */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Icon icon={FileSpreadsheet} className="text-brand-green" />
                                Recipient Data
                            </CardTitle>
                            <CardDescription>Choose how you want to input recipient details.</CardDescription>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => handleModeChange('csv')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'csv' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Bulk Upload (CSV)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('manual')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'manual' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Single Entry
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {mode === 'csv' ? (
                        <>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 w-full space-y-4">
                                    <FileUpload
                                        label="Upload CSV Recipient List"
                                        accept={EXTENSION_TYPES.CSV}
                                        onFileSelect={handleCSVUpload}
                                    />
                                    <div className="flex justify-start">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const headers = ['Name', 'Position', 'Occasion', 'Phone', 'Email'];
                                                const csvContent = headers.join(',') + '\nexample name,example position,example occasion,1234567890,example@email.com';
                                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.setAttribute('href', url);
                                                link.setAttribute('download', 'recipient_template.csv');
                                                link.style.visibility = 'hidden';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="text-sm text-brand-blue hover:text-blue-700 underline flex items-center gap-1"
                                        >
                                            <Icon icon={FileSpreadsheet} size={14} /> Download CSV Template
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    {isUploading ? (
                                        <div className="p-4 bg-gray-50 text-center">Uploading...</div>
                                    ) : batchData ? (
                                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                                            Found {batchData.rowCount} rows.
                                        </Alert>
                                    ) : (
                                        <div className="p-4 bg-gray-50 text-center text-gray-400">No file yet</div>
                                    )}
                                    {error && (
                                        <Alert variant="destructive" className="mt-2">
                                            {error}
                                        </Alert>
                                    )}
                                </div>
                            </div>
                            {/* Preview Table */}
                            {batchData && (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {batchData.headers.map((h: string) => <TableHead key={h}>{h}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {batchData.preview.map((row: any, i: number) => (
                                                <TableRow key={i}>
                                                    {batchData.headers.map((h: string) => <TableCell key={h}>{row[h]}</TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <Input
                                label="Employee Name"
                                placeholder="John Doe"
                                value={manualData.name}
                                onChange={(e) => setInputData({ manualData: { ...manualData, name: e.target.value } })}
                            />
                            <Input
                                label="Position / Role"
                                placeholder="Software Engineer"
                                value={manualData.position}
                                onChange={(e) => setInputData({ manualData: { ...manualData, position: e.target.value } })}
                            />
                            <Input
                                label="Occasion"
                                placeholder="Work Anniversary"
                                value={manualData.occasion}
                                onChange={(e) => setInputData({ manualData: { ...manualData, occasion: e.target.value } })}
                            />
                            <Input
                                label="Phone (Optional)"
                                placeholder="+1 234..."
                                value={manualData.phone || ''}
                                onChange={(e) => setInputData({ manualData: { ...manualData, phone: e.target.value } })}
                            />
                            <Input
                                label="Email (Optional)"
                                placeholder="user@company.com"
                                value={manualData.email || ''}
                                onChange={(e) => setInputData({ manualData: { ...manualData, email: e.target.value } })}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4 pb-20">
                <Button type="button" variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button
                    type="button"
                    disabled={isNextDisabled()}
                    variant="cta"
                    onClick={handleContinue}
                >
                    Next Step: Visual Positioning
                </Button>
            </div>
        </div>
    );
};

export default StepInputData;
