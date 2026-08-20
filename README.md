# Spotify-Requests

Spotify-Requests is a feature playground for me where I plan to keep building and refining new ideas I’d love to see on Spotify.

**Version 1 focuses on building the core API infrastructure and UI foundation**
This React Native mobile application uses the Spotify Web API and AudD Music Recognition API to fetch and display music data, including identifying songs from audio. The project focuses on API integration, asynchronous data fetching, state management, and dynamic UI rendering using React Native.

## Features
- Allows users to log in to their Spotify account
- Identifies songs from audio streams using the AudD Music Recognition API
- Fetches and displays song and artist information using the Spotify Web API
- Provides music recommendations based on identified or selected songs

## Video Walkthrough
- Through this walkthrough, I log in with my Spotify account, see the recent tracks I played, and use the feature to identify a song I'm playing from a separate device.
- I included text on the video to show where the icon is!
<div>

https://github.com/user-attachments/assets/f4e4852e-5eef-4880-9ed9-6a7ba36fd533
  
</div>



## Technical Implementation
- Uses the useEffect() React hook for data fetching and lifecycle management
- Implements async/await for handling asynchronous API calls
- Handles conditional rendering based on authentication and fetched data
- Renders reusable components to display music data
- Dynamically updates content based on user interaction and API responses


## Tech Stack
- React Native
- JavaScript 
- HTML / CSS
- Spotify Web API
- AudD API
- Expo
- OAuth


## Notes
One of the main challenges was working with the Spotify API and understanding the structure of the data returned from different endpoints. Debugging asynchronous requests and ensuring components rendered correctly required careful testing and verification. This project helped strengthen my understanding of API integration, state management, and component-based design in React.
This project began with starter code provided through the Snap Engineering Academy and was further developed to include additional API integrations, features, and improvements.

