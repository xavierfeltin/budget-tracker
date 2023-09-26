import { useRef } from 'react';
import './CSVUploader.css';

export interface InputRangeProps {
    formId: string;
    actionLabel: string;
    handleFiles: (files: File[]) => void;
}

export function CSVUploader({
    formId,
    actionLabel,
    handleFiles} : InputRangeProps) {

    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef(null);

    const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
        const nbFiles = e.currentTarget.files?.length || 0;
        const files: File[] = [];
        for (let i = 0; i < nbFiles; i++) {
            if (e.currentTarget.files) {
                files.push(e.currentTarget.files[i]);
            }
        }
        handleFiles(files);
    };

    return (
        <div style={{marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 32}}>
            <form>
                <label htmlFor={formId} className="button-upload">{actionLabel}</label>
                <input
                    type={"file"}
                    id={formId}
                    accept={".csv"}
                    onChange={handleOnChange}
                    multiple={true}
                    ref={hiddenFileInput}
                    style={{display: 'none'}}
                />
            </form>
        </div>
    )
}