-- Documents table
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    loanid INT,
    document_type ENUM('valuation', 'cr_book', 'vehicle_image', 'residence_image', 'selfie'),
    file_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id)
);