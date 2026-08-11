import JSZip from 'jszip';
import { Project } from '../types';

export async function exportProjectToZip(
  projectName: string,
  files: { [filename: string]: string | undefined },
  readmeContent?: string
): Promise<void> {
  const zip = new JSZip();

  const folderName = (projectName || 'vervox-website')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const root = zip.folder(folderName) || zip;

  // Add all files
  Object.entries(files).forEach(([filename, content]) => {
    if (content !== undefined) {
      root.file(filename, content);
    }
  });

  // Ensure README exists
  if (!files['README.md'] && readmeContent) {
    root.file('README.md', readmeContent);
  } else if (!files['README.md']) {
    root.file(
      'README.md',
      `# ${projectName}\n\nGenerated with VERVOX AI Website Builder.\n\n## Running Locally\nSimply open \`index.html\` in any web browser to view your website.\n`
    );
  }

  // Generate blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download trigger
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function exportProjectAsZip(project: Project): Promise<void> {
  return exportProjectToZip(project.name, project.files);
}
