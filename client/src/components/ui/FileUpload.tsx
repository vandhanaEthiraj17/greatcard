import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn, Icon } from '@/components/common/Icon';

interface FileUploadProps {
    accept?: string;
    onFileSelect: (file: File) => void;
    label?: string;
    className?: string;
    maxSizeMB?: number;
}

const FileUpload = ({ accept, onFileSelect, label, className }: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const validateAndSelect = (file: File) => {
        setError(null);
        // Size validation removed to support large files
        setFileName(file.name);
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSelect(e.target.files[0]);
        }
    };

    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all cursor-pointer bg-gray-50 hover:bg-gray-100",
                    isDragging ? "border-brand-blue bg-blue-50" : "border-gray-300",
                    error ? "border-brand-red bg-red-50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon icon={UploadCloud} className={cn("mb-3", isDragging ? "text-brand-blue" : "text-gray-400")} size={32} />
                    <p className="mb-2 text-sm text-gray-500">
                        {fileName ? (
                            <span className="font-semibold text-brand-blue">{fileName}</span>
                        ) : (
                            <>
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </>
                        )}
                    </p>
                    <p className="text-xs text-gray-400">
                        Supported formats: JPG, PNG, WEBP
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-brand-red">{error}</p>
            )}
        </div>
    );
};

export { FileUpload };
