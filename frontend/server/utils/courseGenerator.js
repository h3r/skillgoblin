import fs from 'fs';
import path from 'path';
import { generateCourseId, naturalSort } from './courseHelpers';

// Function to generate lessons from the folder structure
export const generateLessonsFromFolder = (coursePath) => {
  const lessons = [];
  const supportedLanguages = {
  "zh": "Mandarin Chinese",
  "es": "Spanish",
  "en": "English",
  "hi": "Hindi",
  "ar": "Arabic",
  "bn": "Bengali",
  "pt": "Portuguese",
  "ru": "Russian",
  "ja": "Japanese",
  "pa": "Punjabi",
  "de": "German",
  "jv": "Javanese",
  "ko": "Korean",
  "fr": "French",
  "te": "Telugu",
  "mr": "Marathi",
  "tr": "Turkish",
  "ta": "Tamil",
  "ur": "Urdu",
  "vi": "Vietnamese",
  "it": "Italian",
  "pl": "Polish",
  "fa": "Persian",
  "gu": "Gujarati",
  "uk": "Ukrainian",
  "ro": "Romanian",
  "nl": "Dutch",
  "th": "Thai",
  "ha": "Hausa",
  "my": "Burmese",
  "sw": "Swahili",
  "yo": "Yoruba",
  "zu": "Zulu",
  "he": "Hebrew",
  "hu": "Hungarian",
  "el": "Greek",
  "sv": "Swedish",
  "fi": "Finnish",
  "no": "Norwegian",
  "cs": "Czech"
};

  
  // Get all items in the course directory
  const items = fs.readdirSync(coursePath, { withFileTypes: true });
  console.log(`Processing course at ${coursePath}, found ${items.length} items`, JSON.stringify(items, null, 2));
  
  // Filter for directories (lessons) and MP4 files in the root
  const lessonDirs = items.filter(item => item.isDirectory());
  const rootVideos = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.mp4'));
  const rootSubtitles = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.srt'));
  const rootReadme = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.md'));
  console.log(`Found ${lessonDirs.length} lesson directories, ${rootVideos.length} root videos, ${rootSubtitles.length} root subtitles, and ${rootReadme.length} root README files.`);

  // If there are MP4 files in the root, create a "Main Content" lesson
  if (rootVideos.length > 0) {
    const introVideos = rootVideos.map(video => ({
      title: video.name.replace('.mp4', '').replace(/_/g, ' '),
      file: video.name,
      subtitles: rootSubtitles.filter(sub => sub.name.startsWith(video.name.replace('.mp4', '')))
        .map(sub => {
          const subBaseName = sub.name.replace('.srt', '');
          const langMatch = subBaseName.match(/(?:^|[._])([a-z]{2})(?:$|[._])/);        // Extract language code subtitle filename.
          const langCode = langMatch ? langMatch[1] : 'en'; // Default to English if no match
          const language = supportedLanguages[langCode] || 'English'; // Fallback to English if not found
          const kind = subBaseName.includes('cc') ? 'Captions' : 'Subtitles';

          return{
            label: `${language} ${kind}`,
            kind: kind.toLowerCase(), 
            srclang: langCode,
            src: sub.name,
          };
      }) || [],
    }));
    
    // Sort intro videos using natural sorting
    introVideos.sort((a, b) => naturalSort(a, b));
    
    const introLesson = {
      id: 'main-content',
      title: 'Main Content',
      folder: '', // No subfolder for root videos
      videos: introVideos,
      readme: rootReadme.length > 0 ? rootReadme[0].name : null // Use the first README file if exists
    };
    lessons.push(introLesson);
  }
  
  // Process each lesson directory
  lessonDirs.forEach((lessonDir) => {
    const lessonPath = path.join(coursePath, lessonDir.name);
    const items = fs.readdirSync(lessonPath, { withFileTypes: true });

    const lessonSubtitles = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.srt'));
    const lessonReadme = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.md'));
    const lessonVideos = items.filter(item => !item.isDirectory() && item.name.toLowerCase().endsWith('.mp4'))
      .map(video => ({
        title: video.name.replace('.mp4', '').replace(/_/g, ' '),
        file: video.name, // Store just the filename, not the full path
        subtitles: lessonSubtitles.filter(sub => sub.name.startsWith(video.name.replace('.mp4', '')))
        .map(sub => {
          const subBaseName = sub.name.replace('.srt', '');
          const langMatch = subBaseName.match(/(?:^|[._])([a-z]{2})(?:$|[._])/);        // Extract language code subtitle filename.
          const langCode = langMatch ? langMatch[1] : 'en'; // Default to English if no match
          const language = supportedLanguages[langCode] || 'English'; // Fallback to English if not found
          const kind = subBaseName.includes('cc') ? 'Captions' : 'Subtitles';

          return {
            label: `${language} ${kind}`,
            kind: kind.toLowerCase(), 
            srclang: langCode,
            src: sub.name,
          };
      }) || [],
      }));
    
    if (lessonVideos.length > 0) {
      // Generate a lesson ID from the folder name
      const lessonId = lessonDir.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      // Sort videos using natural sorting
      lessonVideos.sort((a, b) => naturalSort(a, b));
      
      lessons.push({
        id: lessonId,
        title: lessonDir.name,
        folder: lessonDir.name,
        videos: lessonVideos,
        readme: lessonReadme.length > 0 ? lessonReadme[0].name : null // Use the first README file if exists
      });
    }
  });
  
  // Sort lessons by their folder names if they start with numbers
  lessons.sort((a, b) => naturalSort(a, b));
  console.log(`Generated ${lessons.length} lessons for course at ${coursePath}`, lessons);

  return lessons;
};

// Function to generate a course JSON from folder structure
export const generateCourseJson = (courseDir, coursePath) => {
  console.log(`Generating course data for ${courseDir}`);
  
  // Create course ID from directory name
  const courseId = generateCourseId(courseDir);
  
  // Generate lessons from folder structure
  const lessons = generateLessonsFromFolder(coursePath);
  
  // Create the course data object directly from directory structure
  return {
    id: courseId,
    title: courseDir,
    description: `Course: ${courseDir}`,
    thumbnail: 'thumbnail.png', // Always use standardized name
    category: 'Uncategorized',
    releaseDate: new Date().toISOString().split('T')[0],
    lessons: lessons,
    lastUpdate: Date.now() // Add timestamp for cache busting
  };
};
