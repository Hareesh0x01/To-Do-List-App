# Funky To-Do List Application

A visually dynamic, animated to-do list web application with PWA support, alarm notifications, and dark mode. Features crazy animated backgrounds, custom sounds, and vibration alerts!

## 🚨 Important: Running the App Correctly

To avoid CORS, CSP, and audio loading issues, this app **must be run on a local web server** instead of opening the HTML file directly. Here are some options:

### Option 1: Using Python (easiest)
```bash
# Navigate to the app directory
cd path/to/To-Do-List

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open your browser and go to: http://localhost:8000

### Option 2: Using Node.js
```bash
# Install serve globally (if not already installed)
npm install -g serve

# Navigate to the app directory
cd path/to/To-Do-List

# Run the server
serve
```
Then open your browser and go to the URL shown in the terminal (usually http://localhost:3000)

### Option 3: Using VS Code Live Server
If you're using Visual Studio Code, you can install the "Live Server" extension and right-click on `index.html` to open with Live Server.

## 🚀 Features

- Add new tasks with animated interactions
- Set alarms for tasks with custom sounds and vibration alerts
- Snooze alarms for 5, 10, or 15 minutes
- Mark tasks as completed with visual feedback
- Delete tasks with smooth animations
- Filter tasks (All, Active, Completed, With Alarm)
- Random, colorful background animations that change on interactions
- Tasks are saved in local storage (persists after page refresh)
- Dark mode toggle with theme persistence
- PWA support - install as a standalone app
- Vibration alerts on supported devices
- Fully responsive design for mobile and desktop

## ⏰ Alarm Features

- Set a date and time for task completion
- Choose from multiple alert sounds
- Test sounds before setting alarms
- Receive visual, audio, and vibration notifications
- Snooze functionality with customizable duration
- Tasks with alarms display their scheduled time and sound

## 🎨 Visual Effects

- Dynamic, animated background shapes that change colors and positions
- Dark mode with themed color palette
- Smooth animations for all user interactions
- Visual feedback for actions (add, complete, delete)
- Vibration effect animation for alarm notifications

## 🔍 Filter Options

- View all tasks
- View only active (incomplete) tasks
- View only completed tasks
- View tasks with alarms set

## 📱 Progressive Web App (PWA)

- Install the app on your device (desktop/mobile)
- Works offline
- App-like experience with full-screen mode
- Fast loading and responsive performance

## 🎯 Usage

1. Open `index.html` in any modern web browser
2. Type a task in the input field
3. Optionally set an alarm time and select a sound
4. Click "Add Task" or press Enter to add the task
5. Use the check button to mark a task as completed
6. Use the trash button to delete a task
7. Click on filter buttons to show different task categories
8. Toggle between light and dark mode with the moon/sun button
9. Install as a PWA by clicking "Install" in your browser menu
10. When an alarm triggers, choose to dismiss or snooze it

## 📁 File Structure

- `index.html` - The main HTML document
- `style.css` - CSS styling with animations and theme support
- `script.js` - JavaScript for functionality and animations
- `service-worker.js` - Service worker for PWA functionality
- `manifest.json` - Web app manifest for PWA installation
- `/icons` - App icons for PWA installation
- `/sounds` - Local fallback sound files

## 💻 Technologies Used

- HTML5
- CSS3 (Variables, Animations, Transitions, Gradients, Flexbox)
- JavaScript (ES6+)
- Local Storage API
- Web Audio API
- Vibration API
- Service Workers
- Web App Manifest

## 🌙 Dark Mode

- Toggle between light and dark themes
- Automatic theme persistence (remembers your preference)
- Themed color scheme for all elements

## 📢 Notification System

- Visual notifications with pulsing animation
- Audio alerts with custom sound options
- Vibration patterns for physical feedback
- Snooze functionality for later reminders

## 🔍 Troubleshooting

### Audio Not Playing
- Click the "Test Sounds" button that appears in the bottom-right corner to grant audio permission
- Make sure your browser allows autoplay of media
- Check that your device is not muted
- If external sounds fail to load, the app will use local fallback sounds

### Service Worker Not Registering
- Make sure you're running the app on a web server (http/https protocol), not via file:// protocol
- Check your browser console for specific error messages
- Try clearing your browser cache and reloading

### CORS or CSP Issues
- Run the app on a local server as described above
- Do not modify the Content Security Policy in the HTML unless you understand the security implications
- If you're hosting the app on a different domain, you may need to adjust the CSP

## 💻 Browser Compatibility

This app has been tested and works on:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari (limited support for some features)

## 🔒 Security Features

- Content Security Policy (CSP) to prevent XSS attacks
- Input sanitization for task text
- Secure local storage handling
- CORS-aware service worker 