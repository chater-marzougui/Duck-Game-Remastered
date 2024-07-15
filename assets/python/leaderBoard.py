import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import json
import os
import threading
import random
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

leaderboard_file = 'leaderboard.json'

if not os.path.exists(leaderboard_file):
    with open(leaderboard_file, 'w') as file:
        json.dump({"bestScore": 1, "entries": []}, file)


@app.route('/save_coordinates', methods=['POST'])
def save_coordinates():
    data = request.json
    coordinates = data.get('coordinates')

    if not coordinates:
        return jsonify({"status": "error", "message": "No coordinates provided"}), 400

    try:
        print("Saving coordinates", coordinates)
        print(len(coordinates))
        return jsonify({"status": "success", "message": "Coordinates saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    SB = data['SB']
    userName = data['userName']
    theMessage = data['theMessage']
    theScore = int(data['theScore'])

    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)

    if theScore > leaderboard["bestScore"]:
        leaderboard["bestScore"] = theScore

    leaderboard["entries"].append({
        "SB": SB,
        "userName": userName,
        "theMessage": theMessage,
        "theScore": theScore
    })

    leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)

    with open(leaderboard_file, 'w') as file:
        json.dump(leaderboard, file)

    return 'Score submitted successfully!', 200


@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)
        leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)
    return jsonify(leaderboard)


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

cap = cv2.VideoCapture(0)

# Shared variables
detect_markers = False
skip_frame = 0

def camera_thread():
    global detect_markers, skip_frame
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)
    aruco_params = cv2.aruco.DetectorParameters()
    while True:
        if detect_markers:
            ret, frame = cap.read()
            if not ret:
                continue

            skip_frame += 1
            if skip_frame % 5 != 0:
                if skip_frame == 100:
                    skip_frame = 0
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            corners, ids, _ = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)

            if ids is not None:
                for i, marker_id in enumerate(ids):
                    corner = corners[i][0]
                    center = tuple(np.mean(corner, axis=0).astype(int))

                    if marker_id[0] == 12:  # Player 1
                        player_id = "player1"
                    elif marker_id[0] == 33:  # Player 2
                        player_id = "player2"
                    else:
                        continue
                    _ , width = frame.shape[:2]
                    data = {'x': int(width - center[0]), 'y': int(center[1]), 'player_id': player_id, 'should_shoot': True}
                    socketio.emit('position', data)
                    time.sleep(0.1)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        time.sleep(0.02)

thread = threading.Thread(target=camera_thread)
thread.start()

@socketio.on('tracking_data')
def handle_tracking_data(data):
    global detect_markers
    detect_markers = data

if __name__ == '__main__':
    try:
        socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
    finally:
        cap.release()
        cv2.destroyAllWindows()