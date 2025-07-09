import { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { uploadFileToIPFS, getStorageProvider, setStorageProvider, StorageProvider } from '../utils/storage';
import { Upload, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';

export function StorageProviderTest() {
  const { activeAddress } = useWallet();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [currentProvider, setCurrentProvider] = useState<StorageProvider>('pinata');
  const [testingProvider, setTestingProvider] = useState<StorageProvider>('pinata');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !activeAddress) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Get current provider
      const provider = await getStorageProvider(activeAddress);
      setCurrentProvider(provider);

      // Upload file
      const result = await uploadFileToIPFS(selectedFile, provider);
      setUploadResult(result);
      
      // Log fallback information silently (no user notification)
      if (result.success && result.fallbackUsed) {
        console.warn('Lighthouse upload failed, used Pinata as fallback');
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProviderChange = async (provider: StorageProvider) => {
    if (!activeAddress) return;

    try {
      const result = await setStorageProvider(activeAddress, provider);
      if (result.success) {
        setCurrentProvider(provider);
        alert(`Storage provider updated to ${provider}`);
      } else {
        alert(`Failed to update provider: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error updating provider: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <HardDrive className="text-blue-500" size={24} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Storage Provider Test
        </h2>
      </div>

      {!activeAddress ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to test storage providers
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Provider Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Current Storage Provider
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentProvider === 'pinata' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
              }`}>
                {currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)}
              </span>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Change Storage Provider
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleProviderChange('pinata')}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  currentProvider === 'pinata'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Pinata
              </button>
              <button
                onClick={() => handleProviderChange('lighthouse')}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  currentProvider === 'lighthouse'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Lighthouse
              </button>
            </div>
          </div>

          {/* File Upload Test */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Test File Upload
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a file to upload
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900/20 dark:file:text-blue-300"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Upload size={16} />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-4 p-3 rounded-md ${
                uploadResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                  ) : (
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  )}
                  <div>
                    <p className={`font-medium ${
                      uploadResult.success 
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                    </p>
                    {uploadResult.success && (
                      <>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          CID: {uploadResult.cid}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Provider: {uploadResult.provider.charAt(0).toUpperCase() + uploadResult.provider.slice(1)}
                        </p>
                        {uploadResult.fallbackUsed && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                            ⚠️ Fallback used: Your preferred provider was unavailable
                          </p>
                        )}
                      </>
                    )}
                    {uploadResult.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {uploadResult.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 