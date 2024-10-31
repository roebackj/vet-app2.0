import React, { useEffect, useState } from 'react';
import { fetchChannels, fetchFolders, fetchChildren, fetchFolderContents, getExcelFileDownloadUrl } from './graphService';
import * as XLSX from 'xlsx'; // Import XLSX
import './checklist.css';

const SecurePage = () => {
    const [channels, setChannels] = useState([]);
    const [folders, setFolders] = useState([]);
    const [children, setChildren] = useState([]);
    const [folderContents, setFolderContents] = useState([]);
    const [excelData, setExcelData] = useState([]); // State for Excel data
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const teamId = '734d50e9-71e2-42be-b2e9-0535ab4c1911'; // Your team ID
        const driveId = 'b!LaHqOUwB_E6Sn69xhvPUtoG0Qa-dX8dMnq7ayHsvAz4uxaEhOaTLQ7K-kDZ2Itwf'; // Your drive ID
        const itemId = '01WZNNVP36XNURBTJA2NCJJ2426OLPRHM7'; // ID of the General folder
        const studentTrackersFolderId = '01WZNNVP23EWLU4M4YXVE2ULM75ROI4H4N'; // ID of the "Student Trackers" folder

        const getChannels = async () => {
            try {
                const response = await fetchChannels(teamId);
                setChannels(response.value || []);
            } catch (err) {
                console.error('Error fetching channels:', err);
                setError('Failed to fetch channels');
            }
        };

        const getFolders = async () => {
            try {
                const response = await fetchFolders(driveId);
                setFolders(response.value || []);
            } catch (err) {
                console.error('Error fetching folders:', err);
                setError('Failed to fetch folders');
            }
        };

        const getChildren = async () => {
            try {
                const response = await fetchChildren(driveId, itemId);
                setChildren(response.value || []);
            } catch (err) {
                console.error('Error fetching children:', err);
                setError('Failed to fetch children');
            }
        };

        const getFolderContents = async () => {
            try {
                const response = await fetchFolderContents(studentTrackersFolderId);
                setFolderContents(response.value || []);
            } catch (err) {
                console.error('Error fetching folder contents:', err);
                setError('Failed to fetch folder contents');
            }
        };

        const getExcelFile = async () => {
            try {
                const downloadUrl = await getExcelFileDownloadUrl(driveId, studentTrackersFolderId);
                const response = await fetch(downloadUrl);
                const blob = await response.blob(); // Get the blob response
                const data = await blob.arrayBuffer(); // Read the blob as ArrayBuffer
                const workbook = XLSX.read(data); // Parse the Excel file
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert to JSON

                // Filter the data for the relevant columns
                const headers = json[0]; // First row as headers
                const rows = json.slice(1); // Data rows
                const excelData = rows.map(row => ({
                    name: row[10], // K1 (Last Name, First Name)
                    studentId: row[13], // N1 (Student ID)
                    benefit: row[23], // X1 (Benefit)
                })).filter(item => item.name); // Filter out empty names

                setExcelData(excelData); // Set Excel data state
            } catch (err) {
                console.error('Error fetching Excel file:', err);
                setError('Failed to fetch Excel file');
            }
        };

        getChannels();
        getFolders();
        getChildren();
        getFolderContents();
        getExcelFile(); // Fetch the Excel file
    }, []);

    return (
        <div className="secure-page-container">
            <h2>Channels</h2>
            {error && <p>{error}</p>}
            <ul>
                {channels.length > 0 ? (
                    channels.map((channel) => (
                        <li key={channel.id}>
                            <a href={channel.webUrl} target="_blank" rel="noopener noreferrer">
                                {channel.displayName}
                            </a>
                            {channel.description && <p>{channel.description}</p>}
                        </li>
                    ))
                ) : (
                    <li>No channels found.</li>
                )}
            </ul>
            
            <h2>Folders in General Channel</h2>
            <ul>
                {folders.length > 0 ? (
                    folders.map((folder) => (
                        <li key={folder.id}>
                            <a href={folder.webUrl} target="_blank" rel="noopener noreferrer">
                                {folder.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <li>No folders found.</li>
                )}
            </ul>

            <h2>Items in General Folder</h2>
            <ul>
                {children.length > 0 ? (
                    children.map((item) => (
                        <li key={item.id}>
                            <a href={item.webUrl} target="_blank" rel="noopener noreferrer">
                                {item.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <li>No items found in General folder.</li>
                )}
            </ul>

            <h2>Contents of Student Trackers</h2>
            <ul>
                {folderContents.length > 0 ? (
                    folderContents.map((item) => (
                        <li key={item.id}>
                            <a href={item.webUrl} target="_blank" rel="noopener noreferrer">
                                {item.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <li>No contents found in Student Trackers.</li>
                )}
            </ul>

            {/* Display Excel data in a table */}
            <h2>Veteran Data</h2>
            {excelData.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th className="red-header">Name</th>
                            <th className="red-header">Student ID</th>
                            <th className="red-header">Benefit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {excelData.map((veteran, index) => (
                            <tr key={index}>
                                <td>{veteran.name}</td>
                                <td>{veteran.studentId}</td>
                                <td>{veteran.benefit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No veteran data found.</p>
            )}
        </div>
    );
};

export default SecurePage;