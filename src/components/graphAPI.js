// Helper function to retrieve the dynamically updated auth token
const getAuthToken = async () => {
    const token = localStorage.getItem("access_token"); // Replace with your token retrieval method
    if (!token) {
        throw new Error("Authentication token is not available");
    }
    return token;
};

// Function to get the row number for a specific student based on their ID
const getStudentRow = async (studentId) => {
    try {
        const token = await getAuthToken();  // Retrieve the dynamically updated token
        const url = `https://graph.microsoft.com/v1.0/me/drive/items/01WZNNVP7CWGAZAMH3LJCZMLOXL327FB6A/workbook/worksheets('RFC Dummy v2')/usedRange`; // Modify as needed

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, { method: 'GET', headers });
        const data = await response.json();

        if (data && data.values) {
            // Identify the correct column based on the Student ID header
            const headerRow = data.values[0];
            const studentIdColumnIndex = headerRow.findIndex(header => header === "Student ID # (This is NOT your Social Security Number or SSO ID)");

            if (studentIdColumnIndex === -1) {
                throw new Error("Student ID column not found");
            }

            const studentRow = data.values.findIndex(row => row[studentIdColumnIndex] === studentId) + 1;  // Adjust for Excel row numbering
            return studentRow;  // Return the row number
        } else {
            throw new Error("Data not found in Excel sheet");
        }
    } catch (error) {
        console.error("Error finding student row:", error);
        throw error;  // Ensure error is propagated
    }
};

// Function to post the date to Excel for a specific student
const postDateToExcel = async (studentId, dateChecked) => {
    try {
        const studentRow = await getStudentRow(studentId);  // Get the correct row for the student
        if (!studentRow) {
            throw new Error('Student row not found');
        }

        const token = await getAuthToken();  // Retrieve the dynamically updated token
        const url = `https://graph.microsoft.com/v1.0/me/drive/items/01WZNNVP7CWGAZAMH3LJCZMLOXL327FB6A/workbook/worksheets('RFC Dummy v2')/range(address='BE${studentRow}')`; // Ensure this column is correct

        const body = {
            values: [[dateChecked]]  // Update the date in the correct cell for the student
        };

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Failed to update Excel file');
        }

        console.log(`Date ${dateChecked} successfully posted for student ${studentId}`);
    } catch (error) {
        console.error("Error posting date to Excel:", error);
        throw error;  // Ensure error is propagated
    }
};

// Function to get the date from Excel for a specific student
const getDateFromExcel = async (studentId) => {
    try {
        const studentRow = await getStudentRow(studentId);  // Get the row number for the student
        if (!studentRow) {
            throw new Error('Student row not found');
        }

        const token = await getAuthToken();  // Retrieve the dynamically updated token
        const url = `https://graph.microsoft.com/v1.0/me/drive/items/01WZNNVP7CWGAZAMH3LJCZMLOXL327FB6A/workbook/worksheets('RFC Dummy v2')/range(address='BE${studentRow}')`; // Ensure this column is correct

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        const data = await response.json();

        if (data && data.values) {
            const date = data.values[0][0];  // Assuming the date is in the first column of the specified range
            return date;  // Return the retrieved date
        } else {
            throw new Error('Date not found for student');
        }
    } catch (error) {
        console.error("Error getting date from Excel:", error);
        throw error;  // Ensure error is propagated
    }
};

// Export the functions for use in other parts of the app
export { postDateToExcel, getDateFromExcel };
