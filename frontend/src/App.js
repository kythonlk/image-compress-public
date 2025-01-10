"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
function App() {
    const [files, setFiles] = (0, react_1.useState)([]);
    const [baseName, setBaseName] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)('');
    const url = 'http://localhost:3000/upload';
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = selectedFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            filename: file.name,
            status: 'pending',
        }));
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!baseName.trim()) {
            setMessage('Please enter a base name for the images.');
            return;
        }
        if (files.length === 0) {
            setMessage('Please select at least one file.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const formData = new FormData();
            files.forEach(({ file }) => {
                formData.append('files', file);
            });
            formData.append('prefix', baseName);
            const response = yield axios_1.default.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const processedFiles = response.data.files;
            setFiles(prevFiles => prevFiles.map((file, index) => (Object.assign(Object.assign(Object.assign({}, file), { status: processedFiles[index].status }), (processedFiles[index].status === 'error' && {
                error: processedFiles[index].error
            })))));
            if (processedFiles.every((file) => file.status === 'success')) {
                setMessage('All files processed successfully.');
            }
            else {
                setMessage('Some files failed to process. Check individual file status.');
            }
        }
        catch (error) {
            setMessage('Error uploading files: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    });
    const handleBaseNameChange = (e) => {
        const newBaseName = e.target.value;
        setBaseName(newBaseName);
        setFiles(prevFiles => prevFiles.map((file, index) => (Object.assign(Object.assign({}, file), { filename: `${newBaseName}${index + 1}` }))));
    };
    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };
    return (<div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Multiple Image Upload</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Name for Images
            </label>
            <input type="text" value={baseName} onChange={handleBaseNameChange} placeholder="Enter base name (e.g., myImage)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images
            </label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (<div key={index} className={`p-4 border rounded-lg ${file.status === 'success'
                ? 'border-green-200 bg-green-50'
                : file.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <img src={file.preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">{file.file.name}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      New Filename: <strong>{file.filename}</strong>
                    </p>
                    {file.status === 'success' && (<p className="text-sm text-green-600 mt-2">Upload successful</p>)}
                    {file.status === 'error' && (<p className="text-sm text-red-600 mt-2">Upload failed</p>)}
                  </div>
                  <button type="button" onClick={() => removeFile(index)} className="text-red-600 hover:text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>))}
          </div>

          <button type="submit" disabled={loading || files.length === 0} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
            {loading ? 'Uploading...' : 'Upload All Images'}
          </button>
          {message && (<p className={`text-sm text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>)}
        </form>
      </div>
    </div>);
}
exports.default = App;
