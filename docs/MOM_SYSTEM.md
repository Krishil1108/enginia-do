# Minutes of Meeting (MOM) System

## Overview

The MOM system provides comprehensive functionality for creating, managing, and generating professional Minutes of Meeting documents with AI-powered grammar correction and multi-language support.

## Features

### Core Features
- ✅ **AI Grammar Correction**: Uses OpenAI GPT-4o-mini for professional grammar enhancement
- ✅ **Multi-language Support**: Automatic Gujarati to English translation
- ✅ **Document Generation**: Creates Word (DOCX) documents from templates
- ✅ **PDF Conversion**: Optional PDF conversion using LibreOffice
- ✅ **History Tracking**: Complete history of all MOMs per task
- ✅ **Image Support**: Embed images in generated documents
- ✅ **Discussion Points Parsing**: Automatic parsing of numbered discussion points
- ✅ **Template System**: Customizable Word templates

### Text Processing
1. **Language Detection**: Automatically detects Gujarati characters
2. **Translation**: Converts Gujarati text to English using Google Translate
3. **Grammar Enhancement**: 
   - SVO (Subject-Verb-Object) structure correction
   - Tense consistency (simple past/present preferred)
   - Professional tone improvement
   - Clarity and precision enhancement

### Document Generation
- Word template-based document creation
- Support for multiple placeholders
- Image embedding with automatic sizing
- Attendee list formatting
- Discussion points table generation
- Automatic PDF conversion (if LibreOffice installed)

## Installation

### Backend Dependencies

```bash
cd backend
npm install docxtemplater pizzip docxtemplater-image-module-free translate-google openai
```

### Required Environment Variables

Add to your `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional: LibreOffice (for PDF conversion)

**Windows:**
```bash
# Download and install LibreOffice from https://www.libreoffice.org/
# Add to PATH: C:\Program Files\LibreOffice\program
```

**Linux:**
```bash
sudo apt-get install libreoffice
```

**macOS:**
```bash
brew install libreoffice
```

## Setup

### 1. Create Word Template

Create `backend/templates/mom-template.docx` with placeholders:

```
{companyName}
{visitDate}
{location}
{date}

{#attendees}
- {name}
{/attendees}

{#discussionPoints}
{point}
{/discussionPoints}
```

See `backend/templates/README.md` for detailed template instructions.

### 2. Verify Backend Routes

The MOM routes are automatically registered in `server.js`:
```javascript
app.use('/api/mom', momRoutes);
```

### 3. Add Frontend Components

Import components in your React app:
```javascript
import MOMHistory from './components/MOMHistory';
import MOMPreview from './components/MOMPreview';
```

## API Endpoints

### POST `/api/mom/process-text`
Process text with translation and grammar correction.

**Request:**
```json
{
  "text": "Your raw text here (Gujarati or English)"
}
```

**Response:**
```json
{
  "success": true,
  "original": "Original text",
  "processed": "Corrected text",
  "wasTranslated": true,
  "language": "gujarati"
}
```

### POST `/api/mom/save`
Save MOM without generating document.

**Request:**
```json
{
  "taskId": "task_id",
  "visitDate": "2024-01-15",
  "location": "Office",
  "attendees": [{ "name": "John Doe" }],
  "rawContent": "Original text",
  "processedContent": "Corrected text",
  "companyName": "Your Company",
  "createdBy": "user_id"
}
```

### POST `/api/mom/generate-docx-from-template`
Generate Word document and save MOM.

**Request:**
```json
{
  "taskId": "task_id",
  "visitDate": "2024-01-15",
  "location": "Office",
  "attendees": [{ "name": "John Doe" }],
  "rawContent": "Original text",
  "processedContent": "Corrected text",
  "companyName": "Your Company",
  "createdBy": "user_id",
  "images": [
    {
      "base64": "data:image/png;base64,..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "mom": { /* MOM object */ },
  "files": {
    "docxPath": "/path/to/file.docx",
    "pdfPath": "/path/to/file.pdf",
    "docxFilename": "MOM_123456.docx",
    "pdfFilename": "MOM_123456.pdf"
  }
}
```

### GET `/api/mom/history/:taskId`
Get all MOMs for a task.

**Response:**
```json
{
  "success": true,
  "moms": [ /* Array of MOM objects */ ]
}
```

### GET `/api/mom/tasks-with-moms`
Get all tasks that have MOMs.

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task_id",
      "title": "Task name",
      "momCount": 3,
      "lastMomCreated": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET `/api/mom/view/:momId`
Get specific MOM details.

### POST `/api/mom/regenerate-docx-from-template/:momId`
Regenerate document from existing MOM.

### DELETE `/api/mom/:momId`
Delete a MOM.

## Usage Example

### 1. Process Text
```javascript
const response = await axios.post('/api/mom/process-text', {
  text: 'Your meeting notes here'
});

console.log(response.data.processed); // Corrected text
```

### 2. Generate MOM Document
```javascript
const momData = {
  taskId: 'task_id',
  visitDate: '2024-01-15',
  location: 'Conference Room A',
  attendees: [
    { name: 'John Doe' },
    { name: 'Jane Smith' }
  ],
  rawContent: 'Original notes',
  processedContent: 'Corrected notes with proper grammar',
  companyName: 'Your Company',
  createdBy: 'user_id',
  images: [] // Optional
};

const response = await axios.post('/api/mom/generate-docx-from-template', momData);

if (response.data.success) {
  console.log('Document created:', response.data.files.docxFilename);
}
```

### 3. View MOM History
```javascript
import MOMHistory from './components/MOMHistory';

function App() {
  return <MOMHistory />;
}
```

## Discussion Points Format

The system automatically parses numbered discussion points in various formats:

```
1. First point
2. Second point

1) Alternative format
2) Another point

1: Another format
2: Second point

1- Yet another format
2- Last point
```

All these formats are recognized and converted to a structured table in the document.

## File Storage

Generated documents are stored in `backend/temp/`:
- Automatic cleanup keeps only the 10 most recent files
- Both DOCX and PDF versions are generated (if LibreOffice is available)

## Database Schema

### MOM Model
```javascript
{
  taskId: ObjectId (ref: Task),
  title: String,
  date: Date,
  visitDate: String,
  location: String,
  attendees: [{ name: String }],
  rawContent: String,
  processedContent: String,
  createdBy: ObjectId (ref: User),
  companyName: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Grammar Correction Details

The system uses GPT-4o-mini with the following specifications:
- **Temperature**: 0.3 (for consistent, professional output)
- **Max Tokens**: 2000
- **Focus**: 
  - Grammatical error correction
  - SVO structure enforcement
  - Tense consistency
  - Professional tone
  - Clarity improvement

## Troubleshooting

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API quota and billing
- System falls back to basic grammar rules if API fails

### Translation Errors
- System uses Google Translate API via `translate-google` package
- Falls back to original text if translation fails

### PDF Conversion Issues
- Ensure LibreOffice is installed and in PATH
- System returns DOCX only if PDF conversion fails
- Check LibreOffice command: `soffice --version`

### Template Not Found
- Verify `mom-template.docx` exists in `backend/templates/`
- Check file permissions
- See `backend/templates/README.md` for template creation guide

## Best Practices

1. **Template Design**:
   - Keep formatting simple and professional
   - Test template with sample data before production
   - Use consistent placeholder naming

2. **Text Processing**:
   - Process text before saving to database
   - Always store both raw and processed content
   - Validate processed content before document generation

3. **Error Handling**:
   - Always check API responses for errors
   - Provide user feedback for failed operations
   - Log errors for debugging

4. **Performance**:
   - Batch process multiple MOMs if needed
   - Clean up old files regularly
   - Monitor OpenAI API usage

## Security Considerations

- Never expose OpenAI API key in frontend
- Validate all user inputs before processing
- Sanitize file paths to prevent directory traversal
- Implement rate limiting for API endpoints
- Verify user permissions before MOM operations

## Future Enhancements

Potential improvements:
- [ ] Email distribution of generated documents
- [ ] Real-time collaborative editing
- [ ] Advanced template editor
- [ ] Multi-company template support
- [ ] Automated meeting scheduling integration
- [ ] Voice-to-text for meeting notes
- [ ] Analytics dashboard for MOM metrics

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in backend console
3. Verify all dependencies are installed
4. Check environment variables are set correctly
