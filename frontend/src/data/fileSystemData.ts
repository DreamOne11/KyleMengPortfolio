export type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  dateModified: string;
  size: string;
  kind: string;
};

export type FolderData = {
  [folderName: string]: FileItem[];
};

export const folderContents: FolderData = {
  resume: [
    {
      id: '1',
      name: 'Kyle_Meng_Resume.pdf',
      type: 'file',
      dateModified: 'May 30, 2024 at 11:13 PM',
      size: '2.1 MB',
      kind: 'Portable Document Format (PDF)'
    },
    {
      id: '2',
      name: 'Cover_Letter.docx',
      type: 'file',
      dateModified: 'May 28, 2024 at 3:45 PM',
      size: '45 KB',
      kind: 'Microsoft Word Document'
    },
    {
      id: '3',
      name: 'Portfolio_Summary.pdf',
      type: 'file',
      dateModified: 'June 1, 2024 at 2:30 PM',
      size: '5.2 MB',
      kind: 'Portable Document Format (PDF)'
    },
    {
      id: '4',
      name: 'References.docx',
      type: 'file',
      dateModified: 'May 15, 2024 at 4:20 PM',
      size: '28 KB',
      kind: 'Microsoft Word Document'
    },
    {
      id: '5',
      name: 'Certifications',
      type: 'folder',
      dateModified: 'June 10, 2024 at 9:15 AM',
      size: '--',
      kind: 'Folder'
    }
  ],

  contact: [
    {
      id: '1',
      name: 'Kyle_Meng_BusinessCard.png',
      type: 'file',
      dateModified: 'June 5, 2024 at 10:15 AM',
      size: '245 KB',
      kind: 'Portable Network Graphics (PNG)'
    },
    {
      id: '2',
      name: 'LinkedIn_Profile.webloc',
      type: 'file',
      dateModified: 'June 3, 2024 at 3:22 PM',
      size: '1 KB',
      kind: 'Web Internet Location'
    },
    {
      id: '3',
      name: 'GitHub_Profile.webloc',
      type: 'file',
      dateModified: 'June 3, 2024 at 3:25 PM',
      size: '1 KB',
      kind: 'Web Internet Location'
    },
    {
      id: '4',
      name: 'Email_Template.txt',
      type: 'file',
      dateModified: 'May 20, 2024 at 1:45 PM',
      size: '2 KB',
      kind: 'Plain Text Document'
    },
    {
      id: '5',
      name: 'Social_Media_Links',
      type: 'folder',
      dateModified: 'June 1, 2024 at 9:30 AM',
      size: '--',
      kind: 'Folder'
    },
    {
      id: '6',
      name: 'Contact_QR_Code.png',
      type: 'file',
      dateModified: 'June 8, 2024 at 4:12 PM',
      size: '89 KB',
      kind: 'Portable Network Graphics (PNG)'
    }
  ],

  projects: [
    {
      id: '1',
      name: 'Web_Development',
      type: 'folder',
      dateModified: 'June 15, 2024 at 2:45 PM',
      size: '--',
      kind: 'Folder'
    },
    {
      id: '2',
      name: 'Mobile_Apps',
      type: 'folder',
      dateModified: 'June 12, 2024 at 11:30 AM',
      size: '--',
      kind: 'Folder'
    },
    {
      id: '3',
      name: 'Data_Science',
      type: 'folder',
      dateModified: 'June 8, 2024 at 3:20 PM',
      size: '--',
      kind: 'Folder'
    },
    {
      id: '4',
      name: 'Project_Demo_Videos',
      type: 'folder',
      dateModified: 'June 5, 2024 at 1:15 PM',
      size: '--',
      kind: 'Folder'
    }
  ],

  // 嵌套文件夹示例
  certifications: [
    {
      id: '1',
      name: 'AWS_Cloud_Practitioner.pdf',
      type: 'file',
      dateModified: 'March 15, 2024 at 9:30 AM',
      size: '1.2 MB',
      kind: 'Portable Document Format (PDF)'
    },
    {
      id: '2',
      name: 'React_Certificate.pdf',
      type: 'file',
      dateModified: 'April 22, 2024 at 2:15 PM',
      size: '890 KB',
      kind: 'Portable Document Format (PDF)'
    }
  ],

  social_media_links: [
    {
      id: '1',
      name: 'Instagram.webloc',
      type: 'file',
      dateModified: 'June 1, 2024 at 9:30 AM',
      size: '1 KB',
      kind: 'Web Internet Location'
    },
    {
      id: '2',
      name: 'Twitter.webloc',
      type: 'file',
      dateModified: 'June 1, 2024 at 9:32 AM',
      size: '1 KB',
      kind: 'Web Internet Location'
    },
    {
      id: '3',
      name: 'Behance.webloc',
      type: 'file',
      dateModified: 'June 1, 2024 at 9:35 AM',
      size: '1 KB',
      kind: 'Web Internet Location'
    }
  ]
};

// 获取指定文件夹的文件列表
export const getFilesForFolder = (folderName: string): FileItem[] => {
  const normalizedFolderName = folderName.toLowerCase().replace(/\s+/g, '_');
  return folderContents[normalizedFolderName] || [
    {
      id: '1',
      name: 'Empty Folder',
      type: 'file',
      dateModified: 'Today at 12:00 PM',
      size: '0 KB',
      kind: 'This folder is empty'
    }
  ];
}; 