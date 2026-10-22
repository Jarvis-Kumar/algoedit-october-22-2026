


import React, { useState } from 'react';
import { urlToFile } from '../utils/urlToFile';
import { MarketplaceItem } from '../types';

interface PublishStyleModalProps {
    styleImageUrl: string;
    onClose: () => void;
    onPublish: (presetDetails: Omit<MarketplaceItem, 'id' | 'author' | 'rating' | 'downloads' | 'type'>, imageFile: File) => Promise<void>;
}

const PublishStyleModal: React.FC<PublishStyleModalProps> = ({ styleImageUrl, onClose, onPublish }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name || !description) {
            setError('Please provide a name and description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const imageFile = await urlToFile(styleImageUrl, `${name.replace(/\s/g, '_')}.jpg`);
            await onPublish({ name, description, imageUrl: styleImageUrl }, imageFile);
            // Don't close immediately, show a success state
            await new Promise(res => setTimeout(res, 1500)); // Simulate and show success
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-lg cartoon-modal" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Publish Your Style</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <img src={styleImageUrl} alt="Style to publish" className="w-32 h-32 rounded-lg object-cover flex-shrink-0" />
                        <div className="space-y-4 w-full">
                            <div>
                                <label htmlFor="publish-name" className="block text-sm font-medium text-gray-300">Preset Name</label>
                                <input type="text" id="publish-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 rounded-md text-white cartoon-input p-2" placeholder="e.g., Solarpunk Dreams" />
                            </div>
                            <div>
                                <label htmlFor="publish-desc" className="block text-sm font-medium text-gray-300">Description</label>
                                <textarea id="publish-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 rounded-md text-white cartoon-textarea p-2" placeholder="Describe the look and feel" />
                            </div>
                        </div>
                    </div>
                     {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </main>
                <footer className="p-4 bg-gray-900/50 flex justify-end">
                    <button onClick={handleSubmit} disabled={isLoading || !name || !description} className="cartoon-button py-2 px-4 text-sm bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-500">
                        {isLoading ? 'Publishing...' : 'Publish to Marketplace'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PublishStyleModal;