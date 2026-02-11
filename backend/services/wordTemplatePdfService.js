const fs = require('fs');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const ImageModule = require('docxtemplater-image-module-free');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class WordTemplatePdfService {
  constructor() {
    this.templatePath = path.join(__dirname, '..', 'templates', 'mom-template.docx');
    this.tempDir = path.join(__dirname, '..', 'temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Check if template file exists
   * @returns {boolean}
   */
  templateExists() {
    return fs.existsSync(this.templatePath);
  }

  /**
   * Parse discussion points from text into array
   * @param {string} text 
   * @returns {Array<{point: string}>}
   */
  parseDiscussionPoints(text) {
    if (!text) return [];

    const points = [];
    const lines = text.split('\n');
    
    // Match patterns like: 1. text, 1) text, 1: text, 1- text, • text, - text
    const numberPattern = /^\s*(\d+[\.\)\:\-])\s*(.+)/;
    const bulletPattern = /^\s*[•\-\*]\s*(.+)/;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const numberMatch = trimmedLine.match(numberPattern);
      if (numberMatch) {
        points.push({ point: numberMatch[2].trim() });
        continue;
      }
      
      const bulletMatch = trimmedLine.match(bulletPattern);
      if (bulletMatch) {
        points.push({ point: bulletMatch[1].trim() });
      }
    }
    
    // If no formatted points found, treat each non-empty line as a point
    if (points.length === 0) {
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
          points.push({ point: trimmed });
        }
      });
    }
    
    return points;
  }

  /**
   * Generate Word document from template
   * @param {Object} data - MOM data
   * @param {string} outputFileName - Output file name
   * @returns {Promise<{docPath: string}>}
   */
  async generateWordDocument(data, outputFileName) {
    if (!this.templateExists()) {
      throw new Error('Template file not found. Please create backend/templates/mom-template.docx');
    }

    try {
      // Read template
      const content = fs.readFileSync(this.templatePath, 'binary');
      const zip = new PizZip(content);

      // Configure image module if images are provided
      let imageOpts = null;
      if (data.images && data.images.length > 0) {
        imageOpts = {
          centered: false,
          getImage: (tagValue) => {
            // tagValue is base64 string
            return Buffer.from(tagValue, 'base64');
          },
          getSize: (img, tagValue, tagName) => {
            // Return fixed size or read from data
            return [400, 300]; // width, height in pixels
          }
        };
      }

      // Create document
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: imageOpts ? [new ImageModule(imageOpts)] : []
      });

      // Prepare template data
      const templateData = {
        meetingTitle: data.meetingTitle || data.projectName || data.companyName || '',
        meetingDate: data.meetingDate || data.dateOfVisit || data.visitDate || '',
        meetingLocation: data.meetingLocation || data.siteLocation || data.location || '',
        documentTitle: data.documentTitle || 'Minutes of Meeting',
        attendees: data.attendees || [],
        discussionPoints: this.parseDiscussionPoints(data.processedContent || data.rawContent || ''),
        rawContent: data.rawContent || '',
        processedContent: data.processedContent || '',
        images: data.images ? data.images.map(img => img.data) : [],
        // Legacy field support
        projectName: data.projectName || data.companyName || '',
        companyName: data.companyName || '',
        dateOfVisit: data.dateOfVisit || data.visitDate || '',
        visitDate: data.visitDate || data.dateOfVisit || '',
        siteLocation: data.siteLocation || data.location || '',
        location: data.location || data.siteLocation || ''
      };

      console.log('📄 Template data for Word document:', {
        meetingTitle: templateData.meetingTitle,
        meetingDate: templateData.meetingDate,
        meetingLocation: templateData.meetingLocation,
        documentTitle: templateData.documentTitle,
        attendeesCount: templateData.attendees.length,
        discussionPointsCount: templateData.discussionPoints.length
      });

      // Render document
      doc.render(templateData);

      // Generate buffer
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });

      // Save to file
      const docPath = path.join(this.tempDir, outputFileName);
      fs.writeFileSync(docPath, buf);

      console.log(`✅ Word document generated: ${docPath}`);

      return { docPath };
    } catch (error) {
      console.error('❌ Word document generation error:', error);
      throw new Error(`Failed to generate Word document: ${error.message}`);
    }
  }

  /**
   * Convert Word document to PDF using LibreOffice
   * @param {string} docPath - Path to Word document
   * @returns {Promise<{pdfPath: string}>}
   */
  async convertToPdf(docPath) {
    if (!fs.existsSync(docPath)) {
      throw new Error('Document file not found');
    }

    try {
      // Check if LibreOffice is installed
      const libreOfficeCommands = [
        'soffice',
        'libreoffice',
        '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"',
        '"C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"'
      ];

      let libreOfficeCommand = null;
      
      for (const cmd of libreOfficeCommands) {
        try {
          await execAsync(`${cmd} --version`);
          libreOfficeCommand = cmd;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!libreOfficeCommand) {
        throw new Error('LibreOffice not found. Please install LibreOffice for PDF conversion');
      }

      // Convert to PDF
      const outputDir = path.dirname(docPath);
      const convertCommand = `${libreOfficeCommand} --headless --convert-to pdf --outdir "${outputDir}" "${docPath}"`;
      
      console.log('🔄 Converting to PDF...');
      await execAsync(convertCommand);

      const pdfPath = docPath.replace('.docx', '.pdf');

      if (!fs.existsSync(pdfPath)) {
        throw new Error('PDF conversion completed but file not found');
      }

      console.log(`✅ PDF generated: ${pdfPath}`);

      return { pdfPath };
    } catch (error) {
      console.error('❌ PDF conversion error:', error);
      throw new Error(`Failed to convert to PDF: ${error.message}`);
    }
  }

  /**
   * Generate both Word and PDF documents
   * @param {Object} data - MOM data
   * @param {string} outputFileName - Base output file name (without extension)
   * @returns {Promise<{docPath: string, pdfPath: string|null}>}
   */
  async generateDocuments(data, outputFileName) {
    const docFileName = outputFileName.endsWith('.docx') ? outputFileName : `${outputFileName}.docx`;
    
    // Generate Word document
    const { docPath } = await this.generateWordDocument(data, docFileName);

    // Try to generate PDF
    let pdfPath = null;
    try {
      const result = await this.convertToPdf(docPath);
      pdfPath = result.pdfPath;
    } catch (error) {
      console.warn('⚠️ PDF conversion skipped:', error.message);
      // Continue without PDF - it's optional
    }

    return { docPath, pdfPath };
  }

  /**
   * Delete generated files
   * @param {string[]} filePaths 
   */
  cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted: ${filePath}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${filePath}:`, error.message);
        }
      }
    });
  }

  /**
   * Get file as buffer for download
   * @param {string} filePath 
   * @returns {Buffer}
   */
  getFileBuffer(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    return fs.readFileSync(filePath);
  }
}

module.exports = new WordTemplatePdfService();
