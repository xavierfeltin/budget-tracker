import { useRef } from 'react';
import './CSVUploader.css';

export interface InputRangeProps {
    handleFiles: (files: File[]) => void;
}

export function CSVUploader({
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
        <div style={{margin: 5}}>
            <form>
                <label htmlFor="csvFileInput" className="button-upload">Upload Bank accounts...</label>
                <input
                    type={"file"}
                    id={"csvFileInput"}
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