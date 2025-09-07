<a name="readme-top"></a>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
</div>

---

# 🦆 Duck Game Remastered

**A web-based duck shooting game featuring single player, multiplayer modes, and real-time competition.**
Built with ❤️ by [Chater Marzougui](https://github.com/chater-marzougui).

<br />
<div align="center">
  <a href="https://github.com/chater-marzougui/Duck-Game-Remastered">
     <img src="./assets/images/alive-duck.png" alt="Duck Game Remastered Logo" width="256" height="256">
  </a>
  <h3>Duck Game Remastered</h3>
  <p align="center">
    <strong>An exciting web-based duck shooting game with multiplayer support</strong>
    <br />
    <br />
    <a href="https://github.com/chater-marzougui/Duck-Game-Remastered/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/chater-marzougui/Duck-Game-Remastered/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
      </p>
</div>

<br/>

---

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-installation">Installation</a></li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-configuration">Configuration</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
     <li><a href="#-contact">Contact</a></li>
  </ol>
</details>

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## About The Project

**🦆 Duck Game Remastered** is a web-based duck shooting game that combines classic arcade gameplay with modern multiplayer features. Players can enjoy single-player mode or compete with friends in real-time multiplayer matches. The game features an interactive leaderboard system, special game modes, and innovative features like using your phone as a gun controller. Built with HTML5, CSS3, JavaScript, and Socket.io for seamless real-time multiplayer experiences.

### 🎯 Key Features

- 🎮 **Single Player Mode**: Practice your shooting skills against AI-controlled ducks
- 👥 **Multiplayer Mode**: Real-time two-player competition with WebSocket support
- 🏆 **Leaderboard System**: Track high scores and compete with other players
- 📱 **Phone as Gun**: Innovative mobile controller integration for unique gameplay
- 🎯 **Bullet Terrain Visualization**: Advanced graphics showing bullet trajectories and terrain interaction

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ⚡ Getting Started

### Prerequisites
To run Duck Game Remastered, you'll need:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Python 3.x with the following packages:
  - Flask
  - Flask-CORS
  - Flask-SocketIO
  - OpenCV (cv2)
  - NumPy
- A local web server (optional but recommended)
- A webcam (for ArUco marker detection features)

### Installation

```bash
# Step 1: Clone the repository
git clone https://github.com/chater-marzougui/Duck-Game-Remastered.git

# Step 2: Navigate to the project directory
cd Duck-Game-Remastered

# Step 3: Install Python dependencies
pip install flask flask-cors flask-socketio opencv-python numpy

# Step 4: Start the WebSocket server (for multiplayer support)
python assets/python/leaderBoard.py

# Step 5: Open index.html in your web browser
# You can use a local server like:
python -m http.server 8000
# Then visit http://localhost:8000
```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

## 📚 Usage

### Game Modes

1. **Single Player Mode**
   - Click on "Single Player" from the main menu
   - Shoot the corners to calibrate your aim
   - Click "Start" to begin the game
   - Shoot ducks as they appear to score points

2. **Multiplayer Mode** 
   - Ensure the WebSocket server is running on port 5000
   - Click on "Two Players" from the main menu
   - Both players shoot corners to calibrate
   - Click "Start" to begin competitive gameplay

3. **Special Features**
   - **Phone as Gun**: Use your mobile device as a motion controller
   - **Bullet Terrain**: Visualize bullet paths and terrain interactions
   - **Leaderboard**: View high scores and player rankings

### Controls
- **Mouse**: Aim and shoot
- **Click**: Fire at ducks
- **Phone Controller**: Tilt and tap to aim and shoot (when using Phone as Gun mode)

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

## 🪛 Configuration

### Game Settings

You can customize the game experience by modifying the following settings in the JavaScript files:

### Time Configuration
The game duration can be adjusted in `assets/js/game.js`:
```javascript
let gameDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
```

### Server Configuration
For multiplayer functionality, the WebSocket server runs on:
```javascript
const socket = io('http://localhost:5000');
```

### Leaderboard Data
Player scores are stored in `leaderboard.json` and can be reset or modified as needed.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

## 🤝 Contributing

Contributions are what make the open source community amazing\! Any contributions are **greatly appreciated**.

### How to Contribute

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

## 📃 License

This project is open source and available under the MIT License. See `LICENSE` for more information.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

## 📧 Contact

**Chater Marzougui** - [@chater-marzougui](https://github.com/chater-marzougui) - [LinkedIn](https://www.linkedin.com/in/chater-marzougui-342125299/)

Project Link: https://github.com/chater-marzougui/Duck-Game-Remastered

-----

## 🙏 Acknowledgments

- IEEE Sup'Com SB (Student Branch) for providing the platform and support
- Socket.io for real-time multiplayer functionality
- The web development community for inspiration and resources
- All the players who have contributed to the leaderboard and provided feedback

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

-----

🦆 **Ready, Aim, Duck!** - Experience the thrill of classic duck hunting in a modern web environment.


[contributors-shield]: https://img.shields.io/github/contributors/chater-marzougui/Duck-Game-Remastered.svg?style=for-the-badge
[contributors-url]: https://github.com/chater-marzougui/Duck-Game-Remastered/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chater-marzougui/Duck-Game-Remastered.svg?style=for-the-badge
[forks-url]: https://github.com/chater-marzougui/Duck-Game-Remastered/network/members
[stars-shield]: https://img.shields.io/github/stars/chater-marzougui/Duck-Game-Remastered.svg?style=for-the-badge
[stars-url]: https://github.com/chater-marzougui/Duck-Game-Remastered/stargazers
[issues-shield]: https://img.shields.io/github/issues/chater-marzougui/Duck-Game-Remastered.svg?style=for-the-badge
[issues-url]: https://github.com/chater-marzougui/Duck-Game-Remastered/issues
[license-shield]: https://img.shields.io/github/license/chater-marzougui/Duck-Game-Remastered.svg?style=for-the-badge
[license-url]: https://github.com/chater-marzougui/Duck-Game-Remastered/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/chater-marzougui-342125299/
