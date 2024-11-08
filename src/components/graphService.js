// src/components/graphService.js 
import { msalInstance, loginRequest } from './msalInstance';

// Utility function to handle Graph API fetch calls
export const graphApiFetch = async (url, method = 'GET', body = null) => {
    try {
        const account = msalInstance.getAllAccounts()[0];
        if (!account) throw new Error('No active account! Please log in.');

        const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: account,
        });

        const accessToken = response.accessToken;
        if (!accessToken) throw new Error('Access token could not be acquired. Please log in.');

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        headers.append('Content-Type', 'application/json');

        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        };

        const graphResponse = await fetch(`https://graph.microsoft.com/v1.0${url}`, options);
        if (!graphResponse.ok) {
            throw new Error(`Graph API request failed with status ${graphResponse.status}`);
        }

        return await graphResponse.json();
    } catch (error) {
        console.error('Error in graphApiFetch:', error);
        throw new Error('Could not fetch data from Graph API. Please try again.');
    }
};

// Fetch the children of a SharePoint folder (documents or other items)
export const fetchChildren = async (driveId, itemId) => {
    return graphApiFetch(`/drives/${driveId}/items/${itemId}/children`);
};

// Fetch PDF files from a specific SharePoint folder
export const fetchPdfsFromFolder = async (siteId, driveId, folderId) => {
    try {
        const data = await fetchChildren(driveId, folderId);
        // Filter for PDF files
        const pdfs = data.value.filter(item => item.name.endsWith('.pdf'));
        return pdfs;
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        return []; // Return empty array in case of error
    }
};

// Get the direct download URL of a file
export const getFileDownloadUrl = async (driveId, fileId) => {
    try {
        const response = await graphApiFetch(`/drives/${driveId}/items/${fileId}`);
        return response['@microsoft.graph.downloadUrl']; // This URL is direct and can be used in an iframe
    } catch (error) {
        console.error('Error fetching file download URL:', error);
        return null;
    }
};

export const getExcelFileDownloadUrl = async (driveId, folderId) => {
    const response = await fetchChildren(driveId, folderId);
    const fileItem = response.value.find(file => file.name === "RFC Dummy v2.xlsx");
    if (!fileItem) throw new Error('File not found');
    return fileItem["@microsoft.graph.downloadUrl"];
};
