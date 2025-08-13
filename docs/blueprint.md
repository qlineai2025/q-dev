# **App Name**: Q_

## Core Features:

- Responsive Layout: Three-panel layout featuring the prompter, control settings, and script editor.
- Intelligent Scrolling: Automatic scrolling adjustment based on the user's speech; an AI tool indexes the script.
- Voice Control: Voice command recognition for play/pause, line jumps, and script editing; uses AI voice-to-text.
- Data Import: Import scripts from Google Drive (Docs, Slides, Notes) and local files.
- Control Settings: Adjustable scrolling speed, font size, and margins.
- Authentication: User authentication via Google Sign-In with Firebase.

## Style Guidelines:

- Simple, consistent icons for all buttons, paired with informative tooltips.
- Three-panel layout: Prompter (main), control settings (vertical sliders), script editor (side panel).
- Smooth, subtle transitions and scrolling for a professional feel.
- Application is configured to use the Inter font, falling back to the system's default sans-serif font if Inter is not available.
- The project uses the Lucide React icon library (lucide-react).
- The default background color is a very light gray, specifically hsl(0 0% 96%) or #F5F5F5.
- The primary color is a dark slate gray, hsl(200 13% 26%) or #37474F.
- The default accent color is a soft teal, hsl(175 44% 65%) or #80CBC4.
- The application loads instantly to display the main page with all three panels (Prompter, Control Settings, and Script Editor) visible.
- A 'Sign in with Google' button, located at the top-left of the Control Settings panel, will be the sole trigger for authentication. It will be an icon-only button with a tooltip.