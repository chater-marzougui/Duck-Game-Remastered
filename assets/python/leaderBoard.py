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




@app.route('/shoot', methods=['GET'])
def shoot():
    global player1CanShoot, player2CanShoot
    player = request.args.get('player')
    shoot = request.args.get('shoot')

    if player and shoot:
        if player == 'player1':
            player1CanShoot = True
        elif player == 'player2':
            player2CanShoot = True
        return "Shoot event received", 200
    else:
        return "Invalid request", 400

@app.route('/save_coordinates', methods=['POST'])
def save_coordinates():
    data = request.json
    global width_ratio, height_ratio
    coordinates = data.get('coordinates')
    ret, frame = cap.read()
    if not coordinates:
        return jsonify({"status": "error", "message": "No coordinates provided"}), 400
    if ret:
        height , width = frame.shape[:2]
        x = 0
        y = 0
        for i in coordinates:
            if i['x']>x: x = i['x']
            if i['y']>y: y = i['y']
        width_ratio = x / width
        height_ratio = y / height

    try:
        print("Saving coordinates", coordinates)
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
width_ratio = 1.0
height_ratio = 1.0
detect_markers = False
skip_frame = 0
player1CanShoot = False
player2CanShoot = False
aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)
aruco_params = cv2.aruco.DetectorParameters()


def send_detected(corners, ids, width):
    global player1CanShoot, player2CanShoot, width_ratio, height_ratio
    for i, marker_id in enumerate(ids):
        corner = corners[i][0]
        center = tuple(np.mean(corner, axis=0).astype(int))
        if marker_id[0] == 12:
            player_id = "player1"
            data = {'x': int((width - center[0])* width_ratio), 'y': int(center[1] * height_ratio), 'player_id': player_id, 'should_shoot': player1CanShoot}
            player1CanShoot = False
        elif marker_id[0] == 33:
            player_id = "player2"
            data = {'x': int(width - center[0]), 'y': int(center[1]), 'player_id': player_id, 'should_shoot': player2CanShoot}
            player2CanShoot = False
        if data:
            socketio.emit('position', data)

def camera_thread():
    global detect_markers, skip_frame, aruco_dict, aruco_params
    while True:
        if detect_markers:
            ret, frame = cap.read()
            if not ret:
                continue

            skip_frame += 1
            if skip_frame % 2:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            corners, ids, _ = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)

            if ids is not None:
                send_detected(corners, ids, frame.shape[1])
            
            time.sleep(0.02)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        time.sleep(0.08)

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
        #thread.join()
        cv2.destroyAllWindows()