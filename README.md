# Mindful Affirmations - AI-Powered Meditation App

A comprehensive meditation application that generates personalized, AI-powered meditation sessions with text-to-speech audio, customizable affirmations, and mood tracking capabilities.

![Meditation App](./generated-icon.png)

## 🧘‍♀️ Features

### Core Meditation Experience
- **AI-Generated Meditation Scripts**: Personalized meditation content based on purpose (sleep, morning, focus, confidence, stress relief)
- **High-Quality Text-to-Speech**: Professional voice synthesis using ElevenLabs API with multiple voice options
- **Background Music Integration**: Customizable ambient music with volume control
- **Real-time Audio Mixing**: Seamless combination of voice narration and background music

### Customization Options
- **Voice Selection**: Multiple voice styles including calm, motivational, whisper, and therapeutic options for both male and female voices
- **Child-Friendly Voices**: Special character voices like wizards, fairies, and superheroes for younger users
- **Meditation Types**: Support for various meditation practices including:
  - Guided meditation
  - Affirmations
  - Sleep stories
  - Breathing exercises
  - Body scan
  - Mindfulness practices
  - Hypnosis
  - Law of attraction

### Advanced Features
- **Mood Tracking**: Pre and post-meditation mood assessment with rating scales and emotion tags
- **Script Editing**: Full control over meditation scripts with editable sections
- **Structured Content**: Organized meditation flow with intro, breathing exercises, visualizations, affirmations, and ending
- **Session Library**: Save and manage your meditation sessions
- **Progress Analytics**: Track your meditation journey over time

### Audio Management
- **Dynamic Audio Generation**: Real-time creation of personalized meditation audio
- **Persistent Storage**: Efficient audio file management and caching
- **Multiple Formats**: Support for various audio formats (MP3, WAV, M4A)

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for a modern, type-safe UI
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **Shadcn/ui** for beautiful, accessible UI components
- **Framer Motion** for smooth animations and transitions
- **React Query** for efficient data fetching and state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js for the REST API
- **TypeScript** throughout the entire codebase
- **Drizzle ORM** with PostgreSQL for database management
- **Zod** for runtime type validation and schema definition
- **ElevenLabs API** integration for professional text-to-speech

### Infrastructure & Deployment
- **Docker & Docker Compose** for containerized deployment
- **Nginx** as reverse proxy with SSL termination
- **Let's Encrypt** for automated SSL certificate management
- **PostgreSQL** database with connection pooling
- **Persistent file storage** for generated audio files

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for production deployment)
- ElevenLabs API key for text-to-speech functionality
- PostgreSQL database (or use Docker setup)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mindful-affirmations
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   SESSION_SECRET=your_secure_session_secret
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

### Production Deployment

The application includes comprehensive Docker setup for production deployment. See the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on:

- VPS server setup
- Docker container orchestration
- SSL certificate configuration
- Database initialization
- Continuous deployment with GitHub Actions

## 📱 Usage

### Creating a Meditation Session

1. **Choose Your Purpose**: Select from sleep, morning energy, focus, confidence building, or stress relief
2. **Customize Settings**: 
   - Pick your preferred voice style and gender
   - Select background music and adjust volume
   - Choose meditation duration and pause lengths
3. **Add Affirmations**: Use pre-written affirmations or create custom ones
4. **Generate Session**: The AI creates a personalized meditation script
5. **Edit if Desired**: Modify any part of the generated script
6. **Start Meditation**: High-quality audio is generated in real-time

### Mood Tracking

- **Pre-Meditation**: Rate your current mood and select emotion tags
- **Post-Meditation**: Assess how you feel after the session
- **Analytics**: View your mood trends and meditation effectiveness over time

### Session Management

- **Save Sessions**: Keep your favorite meditations in your personal library
- **Replay Anytime**: Access previously generated audio without regeneration
- **Share Settings**: Export meditation configurations to share with others

## 🎯 API Endpoints

### Meditation Management
- `POST /api/meditations` - Create a new meditation session
- `GET /api/meditations` - Retrieve user's meditation library
- `GET /api/meditations/:id` - Get specific meditation details
- `PUT /api/meditations/:id` - Update meditation settings
- `DELETE /api/meditations/:id` - Remove meditation from library

### Audio Generation
- `POST /api/generate-audio` - Generate text-to-speech audio
- `GET /api/audio/:filename` - Stream audio files
- `POST /api/mix-audio` - Combine voice and background music

### User Management
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - End user session
- `GET /api/auth/user` - Get current user profile

## 🎨 Customization

### Adding New Voices
Edit `shared/schema.ts` to add new voice options:
```typescript
{
  id: "new-voice-id",
  name: "Voice Name",
  description: "Voice description and use cases",
  gender: "male" | "female",
  audience: "adult" | "child",
  benefits: ["benefit1", "benefit2"]
}
```

### Custom Meditation Types
Extend the meditation types in the schema to add new meditation styles with specific prompts and structures.

### Background Music
Add new ambient tracks by placing audio files in the public directory and updating the music options in the schema.

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build the application
npm run build

# Start production server
npm start
```

## 📊 Performance Features

- **Audio Caching**: Generated meditations are cached to avoid regeneration
- **Optimized Database Queries**: Efficient data retrieval with proper indexing
- **CDN-Ready**: Static assets optimized for content delivery networks
- **Lazy Loading**: Components and routes loaded on-demand
- **Service Worker**: Background audio processing and offline capabilities

## 🔐 Security

- **Environment Variables**: Secure API key management
- **Session Management**: Encrypted user sessions with secure cookies
- **Input Validation**: Comprehensive request validation using Zod schemas
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **Rate Limiting**: API endpoint protection against abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🙏 Acknowledgments

- **ElevenLabs** for providing high-quality text-to-speech API
- **Shadcn/ui** for the beautiful component library
- **Drizzle Team** for the excellent TypeScript ORM
- **Meditation Community** for inspiration and feedback

## 📞 Support

For support, feature requests, or bug reports, please open an issue on GitHub or contact the development team.

---

**Start your mindfulness journey today with personalized, AI-powered meditation experiences!** 🧘‍♂️✨ 