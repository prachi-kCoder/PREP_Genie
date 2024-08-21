import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please select a valid CSV file.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('No file selected yet! Choose a file !!');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // log response
      console.log(response);

      setData(response.data.data); // Use response.data.data to access the data array
    } catch (err) {
      console.error(err);  // Log the error to get more details
      setError('Error uploading file.');
    }
    setLoading(false);
  };


  return (
    <Container className='mt-5'>
      <h1>PREP GENIE</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Select CSV File</Form.Label>
          <Form.Control
            type='file'
            accept='.csv'
            onChange={handleFileChange}
            disabled={loading}
          />
        </Form.Group>
        <Button variant='primary' type='submit' disabled={loading}>
          {loading ? 'Processing...' : 'Upload'}
        </Button>
      </Form>
      {error && <Alert variant='danger' className='mt-3'>{error}</Alert>}
      {data && (
        <div className='mt-4'>
          <h3>Processed Data</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default App;
