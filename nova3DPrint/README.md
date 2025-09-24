# Nova 3D - 3D Printing Educational Website

A comprehensive educational website about 3D printing technology with integrated ElevenLabs Conversational AI widget for interactive navigation and learning.

## 🌟 Features

- **5 Comprehensive Pages**: Home, About 3D Printing, Techniques, Applications, Materials
- **Interactive AI Assistant**: ElevenLabs widget embedded on every page for voice/text interaction
- **Navigation Integration**: AI can guide users between pages based on their questions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Educational Content**: Complete coverage of 3D printing from basics to advanced topics

## 📚 Content Overview

### Pages
- **Home** (`index.html`) - Welcome page with 3D printing overview
- **About** (`about.html`) - History, principles, advantages, and challenges
- **Techniques** (`techniques.html`) - FDM, SLA, SLS, and other printing methods
- **Applications** (`applications.html`) - Real-world uses across industries
- **Materials** (`materials.html`) - Complete guide to printing materials

### Topics Covered
- 3D printing history and evolution
- Additive manufacturing principles
- Various printing techniques (FDM, SLA, SLS, etc.)
- Industry applications (Medical, Automotive, Aerospace, etc.)
- Material selection (Plastics, Metals, Specialty materials)

## 🤖 ElevenLabs Integration

The website features an embedded ElevenLabs Conversational AI widget that can:
- Answer questions about 3D printing
- Navigate users to relevant pages
- Provide detailed explanations of techniques and materials
- Guide learning through interactive conversations

### Agent ID
- Widget uses agent ID: `agent_1301k3zm8h2tfcbbt9qnm90ac35t`

## 🚀 Getting Started

### Prerequisites
- Node.js (for development server)
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd nova-3d

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with live reload
- `npm run serve` - Start simple HTTP server

## 🎯 Usage

1. Open the website in your browser
2. Navigate through the pages using the top navigation
3. Interact with the ElevenLabs AI widget (bottom-right corner)
4. Ask questions about 3D printing or request navigation to specific topics

### Example AI Interactions
- "Tell me about FDM printing" → Navigates to Techniques page
- "What materials can I use?" → Navigates to Materials page
- "Show me medical applications" → Navigates to Applications page
- "What is 3D printing?" → Navigates to About page

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with responsive design
- **AI Integration**: ElevenLabs Conversational AI Widget
- **Development**: Live-server for hot reload
- **Build Tools**: NPM scripts

## 📁 Project Structure

```
nova-3d/
├── index.html          # Home page
├── about.html          # About 3D printing
├── techniques.html     # Printing techniques
├── applications.html   # Industry applications
├── materials.html      # Materials guide
├── styles.css          # Main stylesheet
├── package.json        # Dependencies and scripts
├── README.md          # Project documentation
└── .gitignore         # Git ignore rules
```

## 🎨 Design Features

- Modern gradient backgrounds
- Card-based layouts
- Responsive grid systems
- Smooth hover animations
- Professional typography
- Mobile-first design approach

## 🔧 Customization

### Styling
Edit `styles.css` to customize:
- Color schemes
- Layout components
- Responsive breakpoints
- Animation effects

### Content
Update HTML files to modify:
- Page content
- Navigation structure
- Educational materials

### AI Integration
Modify the ElevenLabs widget configuration in each HTML file to:
- Change agent behavior
- Update navigation logic
- Customize appearance

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ElevenLabs for the Conversational AI technology
- 3D printing community for educational content inspiration
- Modern web development practices and standards
